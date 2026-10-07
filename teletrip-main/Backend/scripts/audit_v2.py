import json

path = r'c:\wamp64\www\telitrip\teletrip\teletrip-main\hotelbeds_certification_logs v2.json'

with open(path, 'r', encoding='utf-8') as f:
    logs = json.load(f)

print(f"=== AUDIT STATUS FOR hotelbeds_certification_logs v2.json ===")
print(f"Total Log Entries: {len(logs)}\n")

steps = [item.get('step') for item in logs]
print(f"Steps Present: {steps}\n")

all_mtls = True
for idx, entry in enumerate(logs):
    step = entry.get('step')
    req = entry.get('request', {})
    res = entry.get('response', {})
    url = req.get('url', '')
    status = res.get('status')
    body = res.get('body', {})
    
    is_mtls = 'api-mtls.test.hotelbeds.com' in url
    if not is_mtls:
        all_mtls = False

    print(f"Step #{idx+1}: {step}")
    print(f"  URL: {url}")
    print(f"  HTTP Status: {status}")
    print(f"  mTLS Endpoint: {'YES' if is_mtls else 'NO'}")
    
    if step == 'Booking':
        print(f"  Source Marker: {req.get('body', {}).get('source')}")
        print(f"  Booking Reference: {body.get('booking', {}).get('reference')}")
    elif step == 'Cancellation':
        print(f"  Cancellation Reference: {body.get('booking', {}).get('cancellationReference') or body.get('booking', {}).get('reference')}")
    print("")

print(f"=== OVERALL CERTIFICATION VERDICT ===")
if len(logs) == 4 and all_mtls and all(e.get('response', {}).get('status') == 200 for e in logs):
    print("🟢 STATUS: 100% CERTIFIED & PASSED! (Ready to submit to Hotelbeds / BedsOnline)")
else:
    print("⚠️ STATUS: AUDIT COMPLETED — CHECK DETAILS ABOVE")
