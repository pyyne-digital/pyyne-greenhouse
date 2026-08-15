import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { PlaybookSchema, type Playbook } from "@playbook/index";
import { getOctokit, hasGithubAppConfig, REPO_NAME, REPO_OWNER } from "./github";

const CONTENT_DIR = join(process.cwd(), "content/playbooks");
export const playbookPath = (slug: string) => `content/playbooks/${slug}.json`;

function readLocal(slug: string): Playbook | null {
  try {
    const raw = readFileSync(join(CONTENT_DIR, `${slug}.json`), "utf8");
    return PlaybookSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

function listLocal(): Playbook[] {
  try {
    return readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => PlaybookSchema.parse(JSON.parse(readFileSync(join(CONTENT_DIR, f), "utf8"))))
      .sort((a, b) => a.meta.title.localeCompare(b.meta.title));
  } catch {
    return [];
  }
}

async function readRemote(slug: string, ref = "main"): Promise<Playbook | null> {
  const octokit = await getOctokit();
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: playbookPath(slug),
      ref,
    });
    if (Array.isArray(data) || data.type !== "file") return null;
    const raw = Buffer.from(data.content, "base64").toString("utf8");
    return PlaybookSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function listRemote(): Promise<Playbook[]> {
  const octokit = await getOctokit();
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: "content/playbooks",
      ref: "main",
    });
    if (!Array.isArray(data)) return [];
    const slugs = data
      .filter((f) => f.type === "file" && f.name.endsWith(".json"))
      .map((f) => f.name.replace(/\.json$/, ""));
    const all = await Promise.all(slugs.map((s) => readRemote(s)));
    return all.filter((p): p is Playbook => p !== null).sort((a, b) => a.meta.title.localeCompare(b.meta.title));
  } catch {
    return [];
  }
}

/**
 * Reads go through GitHub when the App is configured (always fresh after merges);
 * local fs otherwise (dev).
 */
export async function getPlaybook(slug: string, ref?: string): Promise<Playbook | null> {
  if (hasGithubAppConfig()) return readRemote(slug, ref);
  return readLocal(slug);
}

export async function listPlaybooks(): Promise<Playbook[]> {
  if (hasGithubAppConfig()) return listRemote();
  return listLocal();
}
