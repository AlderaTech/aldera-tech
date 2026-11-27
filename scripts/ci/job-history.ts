import { LANE_LABELS, HISTORY_LANES, type JobTiming } from "./test-sharding";

type WorkflowJob = {
  name: string;
  started_at: string;
  completed_at: string;
  conclusion: string;
};

function records(value: unknown, key: string): Record<string, unknown>[] {
  if (!value || typeof value !== "object" || !(key in value)) return [];
  const items = (value as Record<string, unknown>)[key];
  return Array.isArray(items)
    ? items.filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === "object" && !Array.isArray(item)
      )
    : [];
}

export function parseTiming(job: WorkflowJob): JobTiming | null {
  if (!["success", "failure", "timed_out"].includes(job.conclusion))
    return null;
  const suite = HISTORY_LANES.find((value) =>
    job.name.startsWith(`${LANE_LABELS[value]} (shard `)
  );
  const match = job.name.match(/\(shard (\d+)\/(\d+)\)$/);
  if (!suite || !match || Number(match[1]) > Number(match[2])) return null;
  const seconds =
    (Date.parse(job.completed_at) - Date.parse(job.started_at)) / 1000;
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return { suite, total: Number(match[2]), seconds };
}

export async function readJobHistory(
  repository: string,
  token: string,
  currentRunId: string,
  request: typeof fetch = fetch
): Promise<JobTiming[]> {
  if (
    !/^[a-zA-Z0-9][a-zA-Z0-9-]*\/[\w.-]+$/.test(repository) ||
    [".", ".."].includes(repository.split("/")[1])
  )
    throw new Error("Invalid GitHub repository.");
  const base = `https://api.github.com/repos/${repository}/actions`;
  const get = async (path: string): Promise<unknown> => {
    const response = await request(`${base}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok)
      throw new Error(`Actions history returned HTTP ${response.status}.`);
    return response.json();
  };
  const runs = records(
    await get(
      "/workflows/build-and-deploy.yml/runs?status=completed&per_page=10"
    ),
    "workflow_runs"
  ).filter(
    (run) => typeof run.id === "number" && String(run.id) !== currentRunId
  );
  const history: JobTiming[] = [];
  const seen = new Set<string>();
  for (const run of runs) {
    const timings: JobTiming[] = [];
    for (let page = 1; page <= 3; page++) {
      const jobs = records(
        await get(`/runs/${run.id}/jobs?per_page=100&page=${page}`),
        "jobs"
      );
      for (const job of jobs) {
        if (
          typeof job.name !== "string" ||
          typeof job.started_at !== "string" ||
          typeof job.completed_at !== "string" ||
          typeof job.conclusion !== "string"
        )
          continue;
        const timing = parseTiming(job as WorkflowJob);
        if (timing && !seen.has(timing.suite)) timings.push(timing);
      }
      if (jobs.length < 100) break;
    }
    for (const timing of timings) history.push(timing);
    for (const timing of timings) seen.add(timing.suite);
    if (seen.size === HISTORY_LANES.length) break;
  }
  return history;
}
