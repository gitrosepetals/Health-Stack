import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env, EMAIL_RE } from '../server/src/lib/env';
import { methodNotAllowed, withApi } from '../lib/vercel-api/cors';

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (!name || name.length > 120) {
    res.status(400).json({ error: 'Invalid name.' });
    return;
  }
  if (!email || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Invalid email address.' });
    return;
  }
  if (!message || message.length < 10 || message.length > 5000) {
    res.status(400).json({ error: 'Message must be between 10 and 5000 characters.' });
    return;
  }

  if (!env.resendApiKey) {
    res.status(503).json({ error: 'Contact service is not configured.' });
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.contactFrom,
        to: [env.contactTo],
        reply_to: email,
        subject: `[Lumen Contact] Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      }),
    });

    if (!response.ok) {
      res.status(502).json({ error: 'Unable to send message. Please try again.' });
      return;
    }

    res.status(200).json({ message: "Message sent. We'll get back to you soon." });
  } catch {
    res.status(502).json({ error: 'Unable to send message. Please try again.' });
  }
}

export default withApi(handler);
