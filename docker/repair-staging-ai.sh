#!/bin/sh
set -eu

# Explicit maintenance operation: reuse a validated existing staging upstream key.
# No key, password, environment dump, or provider request is logged.
python3 - <<'PY'
import json
import os
import pathlib
import re
import stat
import subprocess
import tempfile
import time

WEB = "aldera-tech-staging"
UPSTREAM = "aldera-router-staging-9router"

def docker(*args, input=None):
    return subprocess.check_output(["docker", *args], input=input, stderr=subprocess.PIPE).decode().strip()

def replace_key(contents, key):
    if not re.fullmatch(r"[A-Za-z0-9_.:-]{16,512}", key):
        raise ValueError("Invalid upstream key format")
    if len(re.findall(r"^NINE_ROUTER_API_KEY=.*$", contents, re.M)) != 1:
        raise ValueError("Expected exactly one existing API key setting")
    return re.sub(r"^NINE_ROUTER_API_KEY=.*$", lambda _: "NINE_ROUTER_API_KEY=" + key, contents, flags=re.M)

def staging_directory(container):
    labels = container["Config"]["Labels"]
    directory = pathlib.Path(labels["com.docker.compose.project.working_dir"]).resolve()
    if directory.name != WEB or not directory.is_dir():
        raise ValueError("Refusing non-staging compose directory")
    return directory, labels["com.docker.compose.service"]

def atomic_write(path, contents):
    original = path.stat()
    if path.is_symlink():
        raise ValueError("Refusing symlink environment file")
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", dir=path.parent, delete=False) as file:
            temporary = pathlib.Path(file.name)
            os.chmod(temporary, stat.S_IMODE(original.st_mode) & 0o600)
            if hasattr(os, "chown"):
                os.chown(temporary, original.st_uid, original.st_gid)
            file.write(contents)
            file.flush()
            os.fsync(file.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()

def recreate(directory, service):
    subprocess.run(["docker", "compose", "--project-directory", str(directory), "up", "-d", "--no-deps", "--force-recreate", service], stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, check=True)

def main():
    container = json.loads(docker("inspect", WEB))[0]
    environment = dict(value.split("=", 1) for value in container["Config"]["Env"] if "=" in value)
    if environment.get("NINE_ROUTER_BASE_URL", "").rstrip("/") != "http://" + UPSTREAM + ":20128":
        raise ValueError("Refusing an unexpected upstream destination")
    directory, service = staging_directory(container)
    program = r'''
const fs = require("fs"), path = require("path"), {DatabaseSync} = require("node:sqlite");
(async () => {
  const preferred = __PREFERRED_KEY__;
  const db = new DatabaseSync(path.join(process.env.DATA_DIR || "/app/data", "db/data.sqlite"), {readOnly:true});
  const keys = db.prepare('SELECT "key", "isActive" FROM "apiKeys"').all(); db.close();
  keys.sort((a,b)=>Number(b.key===preferred)-Number(a.key===preferred));
  for (const row of keys) {
    if (![true,1,"true","1"].includes(row.isActive) || typeof row.key !== "string") continue;
    const response = await fetch("http://127.0.0.1:20128/v1/models", {headers:{Authorization:`Bearer ${row.key}`},signal:AbortSignal.timeout(4000)});
    if (response.ok && Array.isArray((await response.json()).data)) {
      process.stdout.write(row.key); return;
    }
  }
  process.exitCode=1;
})().catch(()=>{process.exitCode=1;});
'''
    program = program.replace("__PREFERRED_KEY__", json.dumps(environment.get("NINE_ROUTER_API_KEY", "")))
    key = docker("exec", "-i", UPSTREAM, "node", input=program.encode())
    path = directory / ".env"
    original = path.read_text()
    updated = replace_key(original, key)
    if updated == original and key == environment.get("NINE_ROUTER_API_KEY"):
        print("[Staging AI] Existing upstream credential is already synchronized.")
        return
    probe = r'''const r=await fetch("http://127.0.0.1:3000/api/health",{signal:AbortSignal.timeout(4000)});if(r.status!==200)process.exit(1);'''
    atomic_write(path, updated)
    try:
        recreate(directory, service)
        for _ in range(25):
            try:
                docker("exec", WEB, "bun", "--eval", probe)
                print("[Staging AI] Existing upstream API key synchronized; full health HTTP 200.")
                return
            except subprocess.CalledProcessError:
                time.sleep(2)
        raise RuntimeError("Staging health did not recover")
    except Exception:
        atomic_write(path, original)
        recreate(directory, service)
        raise

if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print("[Staging AI] Repair failed safely: " + type(error).__name__)
        raise SystemExit(1)
PY
