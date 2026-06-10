"""
POST /subscribe — Add subscriber via Beehiiv API v2.

Env vars:
  BEEHIIV_API_KEY, BEEHIIV_PUB_ID, CORS_ORIGIN
"""

import os
import sys

import requests
import sentry_sdk
from pydantic import BaseModel, EmailStr, ValidationError

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from shared.http import cors_headers, json_response, parse_body  # noqa: E402

sentry_sdk.init(dsn=os.environ.get("SENTRY_DSN"), traces_sample_rate=0.1)

BEEHIIV_API_KEY = os.environ.get("BEEHIIV_API_KEY", "")
BEEHIIV_PUB_ID = os.environ.get("BEEHIIV_PUB_ID", "")
BEEHIIV_BASE = "https://api.beehiiv.com/v2"


class SubscribeRequest(BaseModel):
    email: EmailStr


def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS" or event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return {"statusCode": 204, "headers": cors_headers(), "body": ""}

    if not BEEHIIV_API_KEY or not BEEHIIV_PUB_ID:
        return json_response(503, {"error": "Newsletter service is not configured."})

    try:
        body = parse_body(event)
        payload = SubscribeRequest(**body)
    except (ValidationError, ValueError) as exc:
        return json_response(400, {"error": "Invalid email address.", "detail": str(exc)})

    url = f"{BEEHIIV_BASE}/publications/{BEEHIIV_PUB_ID}/subscriptions"
    headers = {
        "Authorization": f"Bearer {BEEHIIV_API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "email": str(payload.email),
        "reactivate_existing": True,
        "send_welcome_email": True,
        "utm_source": "lumen-website",
        "utm_medium": "organic",
    }

    try:
        resp = requests.post(url, json=data, headers=headers, timeout=10)
    except requests.RequestException:
        sentry_sdk.capture_message("Beehiiv API request failed")
        return json_response(502, {"error": "Unable to reach newsletter service."})

    if resp.status_code in (200, 201):
        return json_response(200, {"message": "You're in! Check your inbox to confirm."})

    if resp.status_code == 409:
        return json_response(200, {"message": "You're already subscribed. Welcome back."})

    sentry_sdk.capture_message(f"Beehiiv error {resp.status_code}: {resp.text}")
    return json_response(502, {"error": "Subscription failed. Please try again."})
