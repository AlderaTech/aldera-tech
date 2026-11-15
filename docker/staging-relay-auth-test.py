import pathlib
import json
import tempfile
import unittest
from unittest.mock import Mock, patch

SOURCE = pathlib.Path(__file__).with_name("repair-staging-ai.sh").read_text()
CODE = SOURCE.split("python3 - <<'PY'\n", 1)[1].rsplit("\nPY", 1)[0]
MODULE = {"__name__": "repair_fixture"}
exec(compile(CODE, "repair_fixture", "exec"), MODULE)


class StagingRelayAuthTest(unittest.TestCase):
    def fixture(self, root):
        directory = pathlib.Path(root) / "aldera-tech-staging"
        directory.mkdir()
        target = directory / ".env"
        target.write_text("NINE_ROUTER_API_KEY=old\nOTHER=unchanged\n")
        container = {"Config": {"Env": ["NINE_ROUTER_BASE_URL=http://aldera-router-staging-9router:20128", "NINE_ROUTER_API_KEY=old"], "Labels": {"com.docker.compose.project.working_dir": str(directory), "com.docker.compose.service": "app"}}}
        def docker(*args, **kwargs):
            if args[0] == "inspect":
                return json.dumps([container])
            if args[0:3] == ("exec", "-i", "aldera-router-staging-9router"):
                return "fixture-existing-key-123456"
            if args[0:2] == ("exec", "aldera-tech-staging"):
                return ""
            raise AssertionError("Unexpected Docker command")
        return target, docker

    def test_success_reuses_existing_key_and_only_recreates_web_service(self):
        with tempfile.TemporaryDirectory() as root:
            target, docker = self.fixture(root)
            recreate = Mock()
            with patch.dict(MODULE, {"docker": docker, "recreate": recreate}):
                MODULE["main"]()
            self.assertEqual(target.read_text(), "NINE_ROUTER_API_KEY=fixture-existing-key-123456\nOTHER=unchanged\n")
            recreate.assert_called_once_with(target.parent.resolve(), "app")

    def test_failed_recreation_rolls_back_original_environment(self):
        with tempfile.TemporaryDirectory() as root:
            target, docker = self.fixture(root)
            original = target.read_text()
            recreate = Mock(side_effect=[RuntimeError("fixture failure"), None])
            with patch.dict(MODULE, {"docker": docker, "recreate": recreate}):
                with self.assertRaises(RuntimeError):
                    MODULE["main"]()
            self.assertEqual(target.read_text(), original)
            self.assertEqual(recreate.call_count, 2)

    def test_replaces_only_the_upstream_key_and_is_idempotent(self):
        source = "DATABASE_URL=fixture\nNINE_ROUTER_API_KEY=old\nOTHER_SETTING=preserved\n"
        key = "fixture-existing-key-123456"
        updated = MODULE["replace_key"](source, key)
        self.assertEqual(updated, source.replace("API_KEY=old", "API_KEY=" + key))
        self.assertEqual(MODULE["replace_key"](updated, key), updated)

    def test_rejects_multiline_keys_and_ambiguous_env_settings(self):
        for source, key in [("NINE_ROUTER_API_KEY=old\n", "key\nOTHER=value"), ("NINE_ROUTER_API_KEY=a\nNINE_ROUTER_API_KEY=b", "fixture-valid-key-123456"), ("OTHER=value", "fixture-valid-key-123456")]:
            with self.assertRaises(ValueError):
                MODULE["replace_key"](source, key)

    def test_refuses_production_and_preserves_other_file_content(self):
        with tempfile.TemporaryDirectory() as root:
            directory = pathlib.Path(root) / "aldera-tech"
            directory.mkdir()
            container = {"Config": {"Labels": {"com.docker.compose.project.working_dir": str(directory), "com.docker.compose.service": "app"}}}
            with self.assertRaises(ValueError):
                MODULE["staging_directory"](container)
            directory = directory.rename(pathlib.Path(root) / "aldera-tech-staging")
            container["Config"]["Labels"]["com.docker.compose.project.working_dir"] = str(directory)
            self.assertEqual(MODULE["staging_directory"](container), (directory.resolve(), "app"))
            target = directory / ".env"
            target.write_text("fixture-original")
            MODULE["atomic_write"](target, "fixture-updated")
            self.assertEqual(target.read_text(), "fixture-updated")
            self.assertEqual(list(directory.iterdir()), [target])


if __name__ == "__main__":
    unittest.main()
