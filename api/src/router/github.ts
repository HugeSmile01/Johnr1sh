import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from './context.js';
import {
  getAuthenticatedUser,
  listRepositories,
  getRepository,
  listBranches,
  getContents,
  listCommits,
  createOrUpdateFile,
  deleteFile,
  createBranch,
  searchCode,
} from '../services/github.js';

function handleGitHubError(err: unknown): never {
  if (err && typeof err === 'object' && 'status' in err) {
    const status = (err as { status: number }).status;
    if (status === 404) throw new TRPCError({ code: 'NOT_FOUND', message: 'Resource not found on GitHub' });
    if (status === 403) throw new TRPCError({ code: 'FORBIDDEN', message: 'GitHub permission denied' });
    if (status === 401) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'GitHub token invalid or missing' });
    if (status === 422) {
      const msg = (err as { message?: string }).message ?? 'Validation failed';
      throw new TRPCError({ code: 'BAD_REQUEST', message: msg });
    }
  }
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'GitHub API error' });
}

export const githubRouter = router({
  /** Return the GitHub user associated with the configured PAT. */
  me: protectedProcedure.query(async () => {
    try {
      return await getAuthenticatedUser();
    } catch (err) {
      handleGitHubError(err);
    }
  }),

  /** List repositories for the authenticated user. */
  listRepos: protectedProcedure
    .input(
      z.object({
        type: z.enum(['all', 'owner', 'public', 'private', 'member']).optional(),
        sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional(),
        perPage: z.number().int().min(1).max(100).default(30),
        page: z.number().int().min(1).default(1),
      }),
    )
    .query(async ({ input }) => {
      try {
        return await listRepositories(input);
      } catch (err) {
        handleGitHubError(err);
      }
    }),

  /** Get details for a single repository. */
  getRepo: protectedProcedure
    .input(z.object({ owner: z.string().min(1), repo: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        return await getRepository(input.owner, input.repo);
      } catch (err) {
        handleGitHubError(err);
      }
    }),

  /** List branches for a repository. */
  listBranches: protectedProcedure
    .input(
      z.object({
        owner: z.string().min(1),
        repo: z.string().min(1),
        perPage: z.number().int().min(1).max(100).default(30),
        page: z.number().int().min(1).default(1),
      }),
    )
    .query(async ({ input }) => {
      try {
        return await listBranches(input.owner, input.repo, input.perPage, input.page);
      } catch (err) {
        handleGitHubError(err);
      }
    }),

  /** Get the contents of a file or directory. */
  getContents: protectedProcedure
    .input(
      z.object({
        owner: z.string().min(1),
        repo: z.string().min(1),
        path: z.string(),
        ref: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        return await getContents(input.owner, input.repo, input.path, input.ref);
      } catch (err) {
        handleGitHubError(err);
      }
    }),

  /** List commits on a branch or for a specific file path. */
  listCommits: protectedProcedure
    .input(
      z.object({
        owner: z.string().min(1),
        repo: z.string().min(1),
        sha: z.string().optional(),
        path: z.string().optional(),
        perPage: z.number().int().min(1).max(100).default(30),
        page: z.number().int().min(1).default(1),
      }),
    )
    .query(async ({ input }) => {
      try {
        return await listCommits(input);
      } catch (err) {
        handleGitHubError(err);
      }
    }),

  /** Create or update a file in a repository. */
  createOrUpdateFile: protectedProcedure
    .input(
      z.object({
        owner: z.string().min(1),
        repo: z.string().min(1),
        path: z.string().min(1),
        message: z.string().min(1),
        content: z.string(),
        branch: z.string().optional(),
        sha: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await createOrUpdateFile(input);
      } catch (err) {
        handleGitHubError(err);
      }
    }),

  /** Delete a file from a repository. */
  deleteFile: protectedProcedure
    .input(
      z.object({
        owner: z.string().min(1),
        repo: z.string().min(1),
        path: z.string().min(1),
        message: z.string().min(1),
        sha: z.string().min(1),
        branch: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await deleteFile(input);
      } catch (err) {
        handleGitHubError(err);
      }
    }),

  /** Create a new branch from a source commit SHA. */
  createBranch: protectedProcedure
    .input(
      z.object({
        owner: z.string().min(1),
        repo: z.string().min(1),
        branch: z.string().min(1),
        sha: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await createBranch(input.owner, input.repo, input.branch, input.sha);
      } catch (err) {
        handleGitHubError(err);
      }
    }),

  /** Search code across GitHub repositories. */
  searchCode: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        perPage: z.number().int().min(1).max(100).default(30),
        page: z.number().int().min(1).default(1),
      }),
    )
    .query(async ({ input }) => {
      try {
        return await searchCode(input.query, input.perPage, input.page);
      } catch (err) {
        handleGitHubError(err);
      }
    }),
});
