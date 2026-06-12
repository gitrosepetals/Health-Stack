/**
 * Extract a human-readable message from an Angular HttpClient error.
 */
export function httpErrorMessage(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback;

  const httpErr = err as { status?: number; error?: unknown; message?: string; statusText?: string };

  // Network / CORS failure (common on Vercel if CORS_ORIGIN is wrong)
  if (httpErr.status === 0 || httpErr.statusText === 'Unknown Error') {
    return 'API unreachable. The serverless function may be crashing — check Vercel logs and DATABASE_URL.';
  }

  const extracted = extractMessage(httpErr.error);
  if (extracted) return extracted;

  if (httpErr.status === 503) return 'Database unavailable. Set DATABASE_URL on Vercel and run npm run db:setup.';
  if (httpErr.status === 502) return 'API crashed. Check Vercel → Deployments → Functions → Logs.';
  if (httpErr.status === 404) return 'Login API not found. Redeploy with the latest code.';
  if (httpErr.status === 401) return 'Invalid email or password.';

  return fallback;
}

function extractMessage(value: unknown, depth = 0): string | null {
  if (depth > 4 || value == null) return null;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed && trimmed !== '[object Object]') return trimmed;
    return null;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    for (const key of ['error', 'message', 'detail', 'description', 'reason']) {
      const found = extractMessage(record[key], depth + 1);
      if (found) return found;
    }
  }

  return null;
}
