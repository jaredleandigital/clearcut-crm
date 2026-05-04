#!/usr/bin/env python3
"""Seed leads via Convex HTTP API (much faster than npx convex run per lead)."""

import json
import re
import time
import urllib.request
import urllib.error

CONVEX_URL = "https://nautical-marlin-372.convex.cloud"

with open('/tmp/clearcut-leads.json') as f:
    leads = json.load(f)

# Filter test leads
leads = [l for l in leads if l['name'].lower().strip() not in ('jared lean', 'jared')]

# Clean asterisks
for lead in leads:
    for key in ['name', 'phone', 'email', 'address']:
        if lead[key]:
            lead[key] = lead[key].lstrip('* ').strip()

print(f"Seeding {len(leads)} leads...")

# Insert oldest first so newest has highest _creationTime
for i, lead in enumerate(reversed(leads)):
    args = {
        'name': lead['name'],
        'createdAt': lead['epochMs'],
        'source': 'Website',
    }
    if lead['email']:
        args['email'] = lead['email']
    if lead['phone']:
        args['phone'] = lead['phone']
    if lead['inferredService']:
        args['projectType'] = lead['inferredService']
    if lead['address']:
        args['projectAddress'] = lead['address']
    if lead['message']:
        args['notes'] = lead['message']

    payload = {
        "path": "seed:insertLead",
        "args": args,
        "format": "json",
    }
    body = json.dumps(payload).encode()

    req = urllib.request.Request(
        f"{CONVEX_URL}/api/mutation",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        print(f"  [{i+1}/{len(leads)}] {lead['name']} - {lead['inferredService']}")
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"  ERROR [{i+1}] {lead['name']}: {err}")

    # Small delay to preserve insertion order
    time.sleep(0.1)

print(f"\nDone! Seeded {len(leads)} leads.")
