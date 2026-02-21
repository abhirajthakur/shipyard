export async function validateGitHubRepo(
  repoUrl: string,
): Promise<{ valid: boolean; error?: string }> {
  const match = repoUrl.match(
    /^https:\/\/github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9_.-]+)(\.git)?\/?$/,
  );

  if (!match || !match[1] || !match[2]) {
    return { valid: false, error: "Invalid GitHub URL format" };
  }

  const owner = match[1];
  const repo = match[2];

  if (owner.length > 39 || repo.length > 100) {
    return { valid: false, error: "Owner or repository name is too long" };
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
    );

    if (response.status === 404) {
      return {
        valid: false,
        error: "GitHub repository does not exist or is private",
      };
    }

    if (!response.ok) {
      return {
        valid: false,
        error: `GitHub API returned error: ${response.status}`,
      };
    }

    return { valid: true };
  } catch (e) {
    return { valid: false, error: `Failed to reach GitHub API: ${e}` };
  }
}
