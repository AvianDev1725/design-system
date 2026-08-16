// Value import unused below on purpose — this pulls in the package's
// `declare global { var process: { env: ... } }` augmentation (Edge
// Middleware's runtime doesn't get @types/node's ambient `process`),
// and documents the real second parameter Vercel invokes this
// function with, even though this handler doesn't need it.
import type { RequestContext } from '@vercel/edge';

/**
 * Basic Auth gate for the deployed Storybook site — dev and staging
 * only. Production stays fully public: nothing in this file runs
 * there.
 *
 * Vercel injects `VERCEL_ENV` at request time as one of
 * `'production' | 'preview' | 'development'`. Both the `develop` and
 * `staging` branches land as `'preview'` deployments (see
 * .github/workflows/deploy.yml and the README's "Deploying Storybook
 * to Vercel" — genuinely separate dev/staging environments would need
 * Vercel Custom Environments, a Pro-plan feature not set up here), so
 * this one check covers both with the same credentials. `main` is the
 * only branch that deploys with `--prod`, which is what sets
 * `VERCEL_ENV` to `'production'`.
 *
 * Credentials come from `BASIC_AUTH_USER` / `BASIC_AUTH_PASS`, set as
 * Vercel Environment Variables scoped to the **Preview** environment
 * only (Project Settings -> Environment Variables) — never
 * Production, so there's nothing to leak there even by mistake.
 */
export const config = {
  matcher: '/:path*',
};

export default function middleware(
  request: Request,
  _ctx: RequestContext,
): Response | void {
  if (process.env.VERCEL_ENV === 'production') {
    return;
  }

  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  // Fail closed: if the env vars aren't set on a non-prod deployment,
  // that's a misconfiguration, not an invitation to skip the gate.
  if (!user || !pass) {
    return new Response('Basic auth is not configured for this environment.', {
      status: 500,
    });
  }

  const authHeader = request.headers.get('authorization');
  const expected = `Basic ${btoa(`${user}:${pass}`)}`;

  if (authHeader !== expected) {
    return new Response('Authentication required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Avian Dev — restricted"' },
    });
  }
}
