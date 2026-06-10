"""
POST /contact — Send contact form message via AWS SES.

Env vars:
  SES_FROM_EMAIL, SES_TO_EMAIL, AWS_REGION, CORS_ORIGIN
"""

import os
import sys

import boto3
import sentry_sdk
from pydantic import BaseModel, EmailStr, Field, ValidationError

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from shared.http import cors_headers, json_response, parse_body  # noqa: E402

sentry_sdk.init(dsn=os.environ.get("SENTRY_DSN"), traces_sample_rate=0.1)

SES_FROM = os.environ.get("SES_FROM_EMAIL", "hello@lumen.health")
SES_TO = os.environ.get("SES_TO_EMAIL", "team@lumen.health")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

ses = boto3.client("ses", region_name=AWS_REGION)


class ContactRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    message: str = Field(min_length=10, max_length=5000)


def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS" or event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return {"statusCode": 204, "headers": cors_headers(), "body": ""}

    try:
        body = parse_body(event)
        payload = ContactRequest(**body)
    except (ValidationError, ValueError) as exc:
        return json_response(400, {"error": "Invalid form data.", "detail": str(exc)})

    subject = f"[Lumen Contact] Message from {payload.name}"
    body_text = (
        f"Name: {payload.name}\n"
        f"Email: {payload.email}\n\n"
        f"Message:\n{payload.message}"
    )

    try:
        ses.send_email(
            Source=SES_FROM,
            Destination={"ToAddresses": [SES_TO]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {"Text": {"Data": body_text, "Charset": "UTF-8"}},
            },
            ReplyToAddresses=[str(payload.email)],
        )
    except Exception as exc:
        sentry_sdk.capture_exception(exc)
        return json_response(502, {"error": "Unable to send message. Please try again."})

    return json_response(200, {"message": "Message sent. We'll get back to you soon."})
