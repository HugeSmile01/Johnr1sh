import { Octokit } from '@octokit/rest';

function getOctokitClient(): Octokit {
  const token = process.env['GITHUB_TOKEN'];
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  return new Octokit({ auth: token });
}

/** Return the authenticated user's login and profile. */
export async function getAuthenticatedUser() {
  const octokit = getOctokitClient();
  const { data } = await octokit.rest.users.getAuthenticated();
  return data;
}

/** List repositories visible to the authenticated user. */
export async function listRepositories(options: {
  type?: 'all' | 'owner' | 'public' | 'private' | 'member';
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  perPage?: number;
  page?: number;
}) {
  const octokit = getOctokitClient();
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    type: options.type ?? 'owner',
    sort: options.sort ?? 'updated',
    per_page: options.perPage ?? 30,
    page: options.page ?? 1,
  });
  return data;
}

/** Get details about a single repository. */
export async function getRepository(owner: string, repo: string) {
  const octokit = getOctokitClient();
  const { data } = await octokit.rest.repos.get({ owner, repo });
  return data;
}

/** List branches for a repository. */
export async function listBranches(owner: string, repo: string, perPage = 30, page = 1) {
  const octokit = getOctokitClient();
  const { data } = await octokit.rest.repos.listBranches({ owner, repo, per_page: perPage, page });
  return data;
}

/** Get the contents of a file or directory. */
export async function getContents(owner: string, repo: string, path: string, ref?: string) {
  const octokit = getOctokitClient();
  const { data } = await octokit.rest.repos.getContent({ owner, repo, path, ref });
  return data;
}

/** List commits on a branch. */
export async function listCommits(options: {
  owner: string;
  repo: string;
  sha?: string;
  path?: string;
  perPage?: number;
  page?: number;
}) {
  const octokit = getOctokitClient();
  const { data } = await octokit.rest.repos.listCommits({
    owner: options.owner,
    repo: options.repo,
    sha: options.sha,
    path: options.path,
    per_page: options.perPage ?? 30,
    page: options.page ?? 1,
  });
  return data;
}

/** Create or update a file in a repository. */
export async function createOrUpdateFile(options: {
  owner: string;
  repo: string;
  path: string;
  message: string;
  content: string; // plain text — will be base64-encoded
  branch?: string;
  sha?: string; // required when updating an existing file
}) {
  const octokit = getOctokitClient();
  const encodedContent = Buffer.from(options.content, 'utf8').toString('base64');
  const { data } = await octokit.rest.repos.createOrUpdateFileContents({
    owner: options.owner,
    repo: options.repo,
    path: options.path,
    message: options.message,
    content: encodedContent,
    branch: options.branch,
    sha: options.sha,
  });
  return data;
}

/** Delete a file from a repository. */
export async function deleteFile(options: {
  owner: string;
  repo: string;
  path: string;
  message: string;
  sha: string;
  branch?: string;
}) {
  const octokit = getOctokitClient();
  const { data } = await octokit.rest.repos.deleteFile({
    owner: options.owner,
    repo: options.repo,
    path: options.path,
    message: options.message,
    sha: options.sha,
    branch: options.branch,
  });
  return data;
}

/** Create a new branch from a source SHA. */
export async function createBranch(owner: string, repo: string, branch: string, sha: string) {
  const octokit = getOctokitClient();
  const { data } = await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branch}`,
    sha,
  });
  return data;
}

/** Search code across repositories. */
export async function searchCode(query: string, perPage = 30, page = 1) {
  const octokit = getOctokitClient();
  const { data } = await octokit.rest.search.code({ q: query, per_page: perPage, page });
  return data;
}
