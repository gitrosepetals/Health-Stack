import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env, EMAIL_RE } from '../server/src/lib/env';
import { methodNotAllowed, withApi } from './lib/cors';

const BEEHIIV_BASE = 'https://api.beehiiv.com/v2';

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  if (!env.beehiivApiKey || !env.beehiivPubId) {
    res.status(503).json({ error: 'Newsletter service is not configured.' });
    return;
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  if (!email || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Invalid email address.' });
    return;
  }

  const url = `${BEEHIIV_BASE}/publications/${env.beehiivPubId}/subscriptions`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.beehiivApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: 'lumen-website',
        utm_medium: 'organic',
      }),
    });

    if (response.status === 200 || response.status === 201) {
      res.status(200).json({ message: "You're in! Check your inbox to confirm." });
      return;
    }

    if (response.status === 409) {
      res.status(200).json({ message: "You're already subscribed. Welcome back." });
      return;
    }

    res.status(502).json({ error: 'Subscription failed. Please try again.' });
  } catch {
    res.status(502).json({ error: 'Unable to reach newsletter service.' });
  }
}

export default withApi(handler);
