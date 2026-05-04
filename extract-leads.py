#!/usr/bin/env python3
"""Extract Clearcut lead data from Gmail emails."""

import os
import sys
import json
import re
import base64
import time

import importlib.util
spec = importlib.util.spec_from_file_location("my_secrets", "/home/admin/.secrets/secrets_helper.py")
my_secrets = importlib.util.module_from_spec(spec)
spec.loader.exec_module(my_secrets)
my_secrets.load_all_secrets()

import urllib.request
import urllib.parse
import urllib.error

def get_access_token():
    data = urllib.parse.urlencode({
        'client_id': os.environ['GMAIL_CLIENT_ID'],
        'client_secret': os.environ['GMAIL_CLIENT_SECRET'],
        'refresh_token': os.environ['GMAIL_REFRESH_TOKEN'],
        'grant_type': 'refresh_token',
    }).encode()
    req = urllib.request.Request('https://oauth2.googleapis.com/token', data=data, method='POST')
    resp = json.loads(urllib.request.urlopen(req).read())
    return resp['access_token']

def gmail_get(token, path):
    url = f'https://gmail.googleapis.com/gmail/v1/users/me/{path}'
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {token}'})
    return json.loads(urllib.request.urlopen(req).read())

def decode_body(payload):
    """Decode email body from payload."""
    # Direct body
    if payload.get('body', {}).get('data'):
        data = payload['body']['data']
        # base64url decode
        data = data.replace('-', '+').replace('_', '/')
        padding = 4 - len(data) % 4
        if padding != 4:
            data += '=' * padding
        return base64.b64decode(data).decode('utf-8', errors='replace')

    # Multipart
    for part in payload.get('parts', []):
        if part.get('mimeType') in ('text/html', 'text/plain'):
            if part.get('body', {}).get('data'):
                data = part['body']['data']
                data = data.replace('-', '+').replace('_', '/')
                padding = 4 - len(data) % 4
                if padding != 4:
                    data += '=' * padding
                return base64.b64decode(data).decode('utf-8', errors='replace')
        # Nested parts
        result = decode_body(part)
        if result:
            return result
    return ''

def extract_field(html, field_name):
    """Extract a field value from the HTML body."""
    # Try: <strong>Field:</strong> value</p>
    pattern = rf'<strong>{field_name}:?</strong>\s*:?\s*(.*?)</p>'
    m = re.search(pattern, html, re.IGNORECASE | re.DOTALL)
    if m:
        val = m.group(1).strip()
        # Strip HTML tags
        val = re.sub(r'<[^>]+>', '', val)
        return val.strip()

    # Try plain text: Field: value
    pattern = rf'{field_name}:\s*(.+?)(?:\n|$)'
    m = re.search(pattern, html, re.IGNORECASE)
    if m:
        val = m.group(1).strip()
        val = re.sub(r'<[^>]+>', '', val)
        return val.strip()

    return ''

def extract_message(html):
    """Extract message field which may be multi-line."""
    pattern = r'<strong>Message:?</strong>:?\s*(?:<br\s*/?>)?\s*(.*?)(?:<strong>|$)'
    m = re.search(pattern, html, re.IGNORECASE | re.DOTALL)
    if m:
        val = m.group(1).strip()
        val = re.sub(r'<br\s*/?>', ' ', val)
        val = re.sub(r'<[^>]+>', '', val)
        val = re.sub(r'\s+', ' ', val)
        return val.strip()
    return ''

def infer_service(service_field, message, name=''):
    """Infer the project type/service from the form field and message."""
    text = f"{service_field} {message}".lower()

    if any(w in text for w in ['kitchen']):
        return 'Kitchen'
    if any(w in text for w in ['bathroom', 'ensuite', 'shower', 'bath ']):
        return 'Bathroom'
    if any(w in text for w in ['new build', 'new home', 'new house', 'build a home', 'build a house']):
        return 'New Build'
    if any(w in text for w in ['renovation', 'renovate', 'reno ', 'modernise', 'modernize', 'remodel']):
        return 'Renovation'
    if any(w in text for w in ['extension', 'extend', 'addition', 'add a room']):
        return 'Extension'
    if any(w in text for w in ['deck', 'outdoor', 'patio', 'pergola', 'fence']):
        return 'Deck/Outdoor'
    if any(w in text for w in ['commercial', 'office', 'shop', 'warehouse']):
        return 'Commercial'
    if any(w in text for w in ['roof', 'roofing', 'reclad', 'cladding']):
        return 'Renovation'
    if any(w in text for w in ['repair', 'fix', 'leak', 'damage']):
        return 'Renovation'
    if any(w in text for w in ['garage', 'carport', 'shed']):
        return 'Extension'
    if any(w in text for w in ['quote', 'contact', 'enquiry', 'inquiry', 'general']):
        return 'General Enquiry'

    return 'General Enquiry'

def get_email_date(headers):
    """Get date from email headers and return epoch ms."""
    for h in headers:
        if h['name'] == 'Date':
            return h['value']
    return ''

def parse_date_to_epoch(date_str):
    """Parse email date to epoch milliseconds."""
    from email.utils import parsedate_to_datetime
    try:
        dt = parsedate_to_datetime(date_str)
        return int(dt.timestamp() * 1000)
    except:
        return int(time.time() * 1000)

# Main
token = get_access_token()

# Fetch all message IDs with pagination
all_message_ids = []
page_token = None
while True:
    query = urllib.parse.quote('"New Lead" clearcut after:2026/01/01')
    url = f'messages?q={query}&maxResults=100'
    if page_token:
        url += f'&pageToken={page_token}'
    result = gmail_get(token, url)

    messages = result.get('messages', [])
    all_message_ids.extend([m['id'] for m in messages])

    page_token = result.get('nextPageToken')
    if not page_token:
        break

print(f"Found {len(all_message_ids)} emails matching query", file=sys.stderr)

# Fetch each email and extract lead data
leads = []
seen_emails = set()  # Deduplicate by email
seen_phones = set()  # Also deduplicate by phone

for i, msg_id in enumerate(all_message_ids):
    try:
        msg = gmail_get(token, f'messages/{msg_id}?format=full')
    except urllib.error.HTTPError as e:
        print(f"  Error fetching {msg_id}: {e}", file=sys.stderr)
        continue

    headers = msg['payload']['headers']
    subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')

    # Only process actual lead notification emails
    if 'new lead' not in subject.lower():
        continue

    body = decode_body(msg['payload'])
    if not body:
        continue

    name = extract_field(body, 'Lead Name')
    if not name:
        name = extract_field(body, 'Name')
    if not name:
        continue  # Skip if no name

    phone = extract_field(body, 'Lead Phone')
    if not phone:
        phone = extract_field(body, 'Phone')

    email = extract_field(body, 'Lead Email')
    if not email:
        email = extract_field(body, 'Email')
    # Clean email
    email = re.sub(r'mailto:', '', email)

    address = extract_field(body, 'Address')
    service = extract_field(body, 'Service')
    message = extract_message(body)

    date_str = get_email_date(headers)
    epoch_ms = parse_date_to_epoch(date_str)

    # Deduplicate
    dedup_key = email.lower() if email else phone
    if dedup_key and dedup_key in seen_emails:
        continue
    if dedup_key:
        seen_emails.add(dedup_key)

    inferred_service = infer_service(service, message, name)

    lead = {
        'name': name,
        'phone': phone,
        'email': email,
        'address': address,
        'service': service,
        'message': message,
        'inferredService': inferred_service,
        'date': date_str,
        'epochMs': epoch_ms,
    }
    leads.append(lead)

    print(f"  [{i+1}/{len(all_message_ids)}] {name} - {inferred_service} ({date_str[:16]})", file=sys.stderr)

    # Rate limit
    if (i + 1) % 20 == 0:
        time.sleep(1)

# Sort by date, most recent first
leads.sort(key=lambda x: x['epochMs'], reverse=True)

print(f"\nExtracted {len(leads)} unique leads", file=sys.stderr)
print(json.dumps(leads, indent=2))
