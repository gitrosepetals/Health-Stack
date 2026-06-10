"""
GET /articles — Fetch featured articles from DynamoDB.

Env vars:
  ARTICLES_TABLE, AWS_REGION, CORS_ORIGIN
"""

import json
import os
import sys
from decimal import Decimal

import boto3
import sentry_sdk

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from shared.http import cors_headers, json_response  # noqa: E402

sentry_sdk.init(dsn=os.environ.get("SENTRY_DSN"), traces_sample_rate=0.1)

TABLE_NAME = os.environ.get("ARTICLES_TABLE", "lumen-articles")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)

# Fallback articles when DynamoDB is empty or unavailable
FALLBACK_ARTICLES = [
    {
        "id": "ambient-clinical-ai",
        "category": "Health Tech",
        "title": "Why ambient clinical AI just crossed the adoption chasm",
        "summary": "Three health systems went live in Q1. Here's what changed in procurement, liability, and clinician buy-in.",
        "url": "#",
        "published_at": "2026-05-29",
    },
    {
        "id": "cms-prior-auth",
        "category": "Policy",
        "title": "CMS's new prior-auth rule: what operators need to know",
        "summary": "The 72-hour mandate hits July 1. We mapped compliance gaps for mid-size provider groups still on legacy workflows.",
        "url": "#",
        "published_at": "2026-05-22",
    },
    {
        "id": "biotech-q1-charts",
        "category": "Markets",
        "title": "Biotech Q1 in 6 charts: who's funding, who's folding",
        "summary": "Series A volume held steady while crossover rounds dried up. The therapeutic areas still pulling term sheets.",
        "url": "#",
        "published_at": "2026-05-15",
    },
]


def _serialize(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    if isinstance(obj, list):
        return [_serialize(i) for i in obj]
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    return obj


def _fetch_from_dynamodb(limit: int = 10) -> list[dict]:
    table = dynamodb.Table(TABLE_NAME)
    resp = table.scan(Limit=limit)
    items = resp.get("Items", [])
    items.sort(key=lambda x: x.get("published_at", ""), reverse=True)
    return _serialize(items)


def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS" or event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return {"statusCode": 204, "headers": cors_headers(), "body": ""}

    params = event.get("queryStringParameters") or {}
    limit = min(int(params.get("limit", 10)), 50)

    try:
        articles = _fetch_from_dynamodb(limit)
        if not articles:
            articles = FALLBACK_ARTICLES[:limit]
    except Exception as exc:
        sentry_sdk.capture_exception(exc)
        articles = FALLBACK_ARTICLES[:limit]

    return {
        "statusCode": 200,
        "headers": {**cors_headers(), "Content-Type": "application/json"},
        "body": json.dumps({"articles": articles}),
    }
