import { App } from "@octokit/app";
import { Octokit } from "@octokit/rest";

export const REPO_OWNER = process.env.GITHUB_REPO_OWNER ?? "pyyne-digital";
export const REPO_NAME = process.env.GITHUB_REPO_NAME ?? "pyyne-greenhouse";

export function hasGithubAppConfig(): boolean {
  return Boolean(
    process.env.GITHUB_APP_ID &&
      process.env.GITHUB_APP_PRIVATE_KEY &&
      process.env.GITHUB_APP_INSTALLATION_ID
  );
}

let cachedOctokit: Octokit | null = null;

export async function getOctokit(): Promise<Octokit> {
  if (cachedOctokit) return cachedOctokit;
  if (!hasGithubAppConfig()) {
    throw new Error(
      "GitHub App not configured. Set GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY and GITHUB_APP_INSTALLATION_ID."
    );
  }
  const app = new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  });
  cachedOctokit = await app.getInstallationOctokit(
    Number(process.env.GITHUB_APP_INSTALLATION_ID)
  ) as unknown as Octokit;
  return cachedOctokit;
}
