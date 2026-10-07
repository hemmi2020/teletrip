import urllib.request
import json

url = 'https://telitrip-backend.onrender.com/api/admin/certification-logs/download'
print('Fetching live logs from:', url)

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        print('HTTP Status:', resp.status)
        data = json.loads(resp.read().decode('utf-8'))
        print(f'Total log entries returned: {len(data)}\n')
        
        steps = {}
        mtls_count = 0
        booking_entries = []
        cancellation_entries = []
        
        for idx, item in enumerate(data):
            step = item.get('step')
            steps[step] = steps.get(step, 0) + 1
            u = item.get('request', {}).get('url', '')
            if 'api-mtls.test.hotelbeds.com' in u:
                mtls_count += 1
            if step == 'Booking':
                booking_entries.append((idx + 1, item))
            elif step == 'Cancellation':
                cancellation_entries.append((idx + 1, item))
        
        print('=== STEP DISTRIBUTION ===')
        for s, count in steps.items():
            print(f'  - {s}: {count}')
        
        print(f'\n=== mTLS ENDPOINT COMPLIANCE ===')
        print(f'  - mTLS Requests: {mtls_count} / {len(data)} ({(mtls_count/len(data))*100:.1f}%)')
        
        if booking_entries:
            print('\n=== BOOKING ENTRIES ===')
            for idx, item in booking_entries:
                u = item.get('request', {}).get('url')
                st = item.get('response', {}).get('status')
                ref = item.get('response', {}).get('body', {}).get('booking', {}).get('reference')
                source = item.get('request', {}).get('body', {}).get('source')
                print(f'  [Entry #{idx}] URL: {u} | Status: {st} | Ref: {ref}')
                print(f'    Source Marker: {source}')
        else:
            print('\n⚠️ NO BOOKING ENTRIES FOUND')

        if cancellation_entries:
            print('\n=== CANCELLATION ENTRIES ===')
            for idx, item in cancellation_entries:
                u = item.get('request', {}).get('url')
                st = item.get('response', {}).get('status')
                ref = item.get('response', {}).get('body', {}).get('booking', {}).get('cancellationReference') or item.get('response', {}).get('body', {}).get('booking', {}).get('reference')
                print(f'  [Entry #{idx}] URL: {u} | Status: {st} | Ref: {ref}')
        else:
            print('\n⚠️ NO CANCELLATION ENTRIES FOUND')

except Exception as e:
    print('Error fetching logs:', e)
