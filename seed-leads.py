#!/usr/bin/env python3
"""Seed Clearcut CRM leads from extracted email data."""

import json
import subprocess
import sys
import re
import time

with open('/tmp/clearcut-leads.json') as f:
    leads = json.load(f)

# Filter out test leads (Jared Lean, Jared)
leads = [l for l in leads if not re.match(r'^Jared\b', l['name'], re.IGNORECASE) or 'lean' not in l['name'].lower()]
# Actually be more specific - remove "Jared Lean" and "Jared" (test entries)
leads = [l for l in leads if l['name'].lower().strip() not in ('jared lean', 'jared')]

# Clean up asterisks from data
for lead in leads:
    for key in ['name', 'phone', 'email', 'address']:
        if lead[key]:
            lead[key] = lead[key].lstrip('* ').strip()

print(f"Seeding {len(leads)} leads (oldest first so newest ends up on top)...")

# Insert oldest first so the most recent leads have the highest _creationTime
# (Convex orders by _creationTime desc, so last inserted = first shown)
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

    args_json = json.dumps(args)

    result = subprocess.run(
        ['npx', 'convex', 'run', 'seed:insertLead', args_json],
        capture_output=True, text=True,
        env={
            **dict(__import__('os').environ),
            'CONVEX_DEPLOY_KEY': 'prod:nautical-marlin-372|eyJ2MiI6IjIwYjhlYTM0ODczMjQ0ZDBiYTExYjJiZGEwNGM2NTg1In0='
        }
    )

    if result.returncode != 0:
        print(f"  ERROR [{i+1}] {lead['name']}: {result.stderr.strip()}")
    else:
        print(f"  [{i+1}/{len(leads)}] {lead['name']} - {lead['inferredService']}")

    # Small delay to maintain insertion order
    time.sleep(0.3)

print(f"\nDone! Seeded {len(leads)} leads.")
