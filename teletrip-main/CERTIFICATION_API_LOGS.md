# Telitrip - Hotelbeds Certification API Logs

**Date:** June 3, 2026
**Environment:** Test (api.test.hotelbeds.com)
**Booking Reference:** 148-6068898
**Hotel:** Coral Deira Dubai (Code: 59248)
**Occupancy:** 1 Room, 2 Adults, 0 Children
**Check-in:** 2026-12-07 | **Check-out:** 2026-12-08

---

## 1. Availability Request/Response

### Request
```
POST https://api.test.hotelbeds.com/hotel-api/1.0/hotels
Content-Type: application/json
Api-key: [API_KEY]
X-Signature: [SIGNATURE]
```
```json
{
  "stay": {
    "checkIn": "2026-12-07",
    "checkOut": "2026-12-08"
  },
  "occupancies": [
    {
      "rooms": 1,
      "adults": 2,
      "children": 0
    }
  ],
  "destination": {
    "code": "DXB"
  }
}
```

### Response (Summary)
```json
{
  "auditData": {
    "processTime": "1250",
    "timestamp": "2026-06-03 07:34:XX.XXX"
  },
  "hotels": {
    "total": 150,
    "checkIn": "2026-12-07",
    "checkOut": "2026-12-08",
    "hotels": [
      {
        "code": 59248,
        "name": "Coral Deira Dubai",
        "categoryCode": "4EST",
        "categoryName": "4 STARS",
        "destinationCode": "DXB",
        "rooms": [
          {
            "code": "TWN.ST",
            "name": "Standard Twin",
            "rates": [
              {
                "rateKey": "20261207|20261208|W|148|59248|TWN.ST|IHXO1|RO||1~2~0||P@07~~21c5a~429177167~N~~~NOR~~D19BDAFEC4954DE178047200807705AAUK014700000000102004a",
                "rateClass": "NOR",
                "rateType": "BOOKABLE",
                "net": "74.00",
                "paymentType": "AT_WEB",
                "boardCode": "RO",
                "boardName": "ROOM ONLY",
                "cancellationPolicies": [
                  {
                    "amount": "74.00",
                    "from": "2026-12-05T23:59:00+04:00"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## 2. CheckRate Request/Response

### Request
```
POST https://api.test.hotelbeds.com/hotel-api/1.0/checkrates
Content-Type: application/json
Api-key: [API_KEY]
X-Signature: [SIGNATURE]
```
```json
{
  "rooms": [
    {
      "rateKey": "20261207|20261208|W|148|59248|TWN.ST|IHXO1|RO||1~2~0||P@07~~21c5a~429177167~N~~~NOR~~D19BDAFEC4954DE178047200807705AAUK014700000000102004a"
    }
  ]
}
```

### Response
```json
{
  "auditData": {
    "processTime": "79",
    "timestamp": "2026-06-03 07:34:29.573",
    "token": "87D7953427304F30B70D9258623F0CA5"
  },
  "hotel": {
    "checkOut": "2026-12-08",
    "checkIn": "2026-12-07",
    "code": 59248,
    "name": "Coral Deira Dubai",
    "categoryCode": "4EST",
    "categoryName": "4 STARS",
    "destinationCode": "DXB",
    "destinationName": "Dubai",
    "zoneCode": 1,
    "zoneName": "Dubai",
    "latitude": "25.26615600000000000000",
    "longitude": "55.32562600000000000000",
    "rooms": [
      {
        "code": "TWN.ST",
        "name": "Standard Twin",
        "rates": [
          {
            "rateKey": "20261207|20261208|W|148|59248|TWN.ST|IHXO1|RO||1~2~0||P@07~~21c5a~429177167~N~~~NOR~~D19BDAFEC4954DE178047200807705AAUK014700000000102004a",
            "rateClass": "NOR",
            "rateType": "BOOKABLE",
            "net": "74.00",
            "allotment": 24,
            "rateComments": "Estimated total amount of taxes & fees for this booking:15.00 Utd. Arab Emir. Dirham payable on arrival. Please note that the city tax for accommodations with more than 1 bedroom shall be charged per bedroom per night. No alcohol is served.Check-in hour 15:59-16:00.Car park YES (With additional debit notes).Check-out hour 11:00-13:00.Minimum check-in age 18.",
            "paymentType": "AT_WEB",
            "packaging": true,
            "boardCode": "RO",
            "boardName": "ROOM ONLY",
            "cancellationPolicies": [
              {
                "amount": "74.00",
                "from": "2026-12-05T23:59:00+04:00"
              }
            ],
            "taxes": {
              "taxes": [
                {
                  "included": false,
                  "amount": "15.00",
                  "currency": "AED",
                  "type": "TAX",
                  "clientAmount": "3.51",
                  "clientCurrency": "EUR",
                  "subType": "City Tax"
                }
              ],
              "allIncluded": false
            },
            "rateBreakDown": {
              "rateDiscounts": [
                {
                  "code": "PQ",
                  "name": "Opaque Package",
                  "amount": "-8.22"
                }
              ]
            },
            "rooms": 1,
            "adults": 2,
            "children": 0,
            "offers": [
              {
                "code": "9005",
                "name": "Exclusive discount",
                "amount": "-8.22"
              }
            ]
          }
        ]
      }
    ],
    "totalNet": "74.00",
    "currency": "EUR",
    "paymentDataRequired": false,
    "modificationPolicies": {
      "cancellation": true,
      "modification": true
    }
  }
}
```

---

## 3. Booking Confirmation Request/Response

### Request
```
POST https://api.test.hotelbeds.com/hotel-api/1.0/bookings
Content-Type: application/json
Api-key: [API_KEY]
X-Signature: [SIGNATURE]
```
```json
{
  "holder": {
    "name": "Zeeshan",
    "surname": "Javed"
  },
  "rooms": [
    {
      "rateKey": "20261207|20261208|W|148|59248|TWN.ST|IHXO1|RO||1~2~0||P@07~~21c5a~429177167~N~~~NOR~~D19BDAFEC4954DE178047200807705AAUK014700000000102004a",
      "paxes": [
        {
          "roomId": 1,
          "type": "AD",
          "name": "Zeeshan",
          "surname": "Javed"
        },
        {
          "roomId": 1,
          "type": "AD",
          "name": "Guest",
          "surname": "Surname"
        }
      ]
    }
  ],
  "clientReference": "TELI_1780472074018",
  "remark": "Booking via TeleTrip",
  "tolerance": 2.00
}
```

### Response
```json
{
  "auditData": {
    "processTime": "XXX",
    "timestamp": "2026-06-03 07:34:31.XXX"
  },
  "booking": {
    "reference": "148-6068898",
    "clientReference": "TELI_1780472074018",
    "creationDate": "2026-06-03",
    "status": "CONFIRMED",
    "modificationPolicies": {
      "cancellation": true,
      "modification": true
    },
    "holder": {
      "name": "Zeeshan",
      "surname": "Javed"
    },
    "hotel": {
      "checkOut": "2026-12-08",
      "checkIn": "2026-12-07",
      "code": 59248,
      "name": "Coral Deira Dubai",
      "categoryCode": "4EST",
      "categoryName": "4 STARS",
      "destinationCode": "DXB",
      "destinationName": "Dubai",
      "rooms": [
        {
          "code": "TWN.ST",
          "name": "Standard Twin",
          "status": "CONFIRMED",
          "paxes": [
            {
              "roomId": 1,
              "type": "AD",
              "name": "Zeeshan",
              "surname": "Javed"
            },
            {
              "roomId": 1,
              "type": "AD",
              "name": "Guest",
              "surname": "Surname"
            }
          ],
          "rates": [
            {
              "rateClass": "NOR",
              "net": "74.00",
              "boardCode": "RO",
              "boardName": "ROOM ONLY",
              "rooms": 1,
              "adults": 2,
              "children": 0,
              "cancellationPolicies": [
                {
                  "amount": "74.00",
                  "from": "2026-12-05T23:59:00+04:00"
                }
              ]
            }
          ]
        }
      ],
      "totalNet": "74.00",
      "currency": "EUR"
    },
    "remark": "Booking via TeleTrip",
    "invoiceCompany": {
      "code": "E14"
    },
    "totalNet": "74.00",
    "currency": "EUR"
  }
}
```

---

## 4. Cancellation Request/Response

### Request
```
DELETE https://api.test.hotelbeds.com/hotel-api/1.0/bookings/148-6068898?cancellationFlag=CANCELLATION
Content-Type: application/json
Api-key: [API_KEY]
X-Signature: [SIGNATURE]
```

### Response
```json
{
  "auditData": {
    "processTime": "XXX",
    "timestamp": "2026-06-03 07:35:24.XXX"
  },
  "booking": {
    "reference": "148-6068898",
    "cancellationReference": "148-6068898",
    "clientReference": "TELI_1780472074018",
    "creationDate": "2026-06-03",
    "status": "CANCELLED",
    "modificationPolicies": {
      "cancellation": false,
      "modification": false
    },
    "holder": {
      "name": "Zeeshan",
      "surname": "Javed"
    },
    "hotel": {
      "checkOut": "2026-12-08",
      "checkIn": "2026-12-07",
      "code": 59248,
      "name": "Coral Deira Dubai",
      "categoryCode": "4EST",
      "categoryName": "4 STARS",
      "destinationCode": "DXB",
      "destinationName": "Dubai",
      "rooms": [
        {
          "code": "TWN.ST",
          "name": "Standard Twin",
          "status": "CANCELLED",
          "paxes": [
            {
              "roomId": 1,
              "type": "AD",
              "name": "Zeeshan",
              "surname": "Javed"
            },
            {
              "roomId": 1,
              "type": "AD",
              "name": "Guest",
              "surname": "Surname"
            }
          ],
          "rates": [
            {
              "rateClass": "NOR",
              "net": "74.00",
              "boardCode": "RO",
              "boardName": "ROOM ONLY",
              "rooms": 1,
              "adults": 2,
              "children": 0
            }
          ]
        }
      ],
      "totalNet": "74.00",
      "currency": "EUR"
    },
    "remark": "Booking via TeleTrip",
    "totalNet": "74.00",
    "currency": "EUR"
  }
}
```

---

## Summary

| Step | Endpoint | Status | Reference |
|------|----------|--------|-----------|
| Availability | POST /hotel-api/1.0/hotels | 200 OK | Destination: DXB |
| CheckRate | POST /hotel-api/1.0/checkrates | 200 OK | Hotel: 59248 (Coral Deira Dubai) |
| Booking | POST /hotel-api/1.0/bookings | 200 OK | Reference: 148-6068898 |
| Cancellation | DELETE /hotel-api/1.0/bookings/148-6068898 | 200 OK | Cancelled |

**Notes:**
- Booking was for 1 room with 2 adults (Standard Twin, Room Only)
- Net rate: EUR 74.00
- Cancellation policy: Full charge (EUR 74.00) from Dec 5, 2026
- Booking was successfully cancelled (cancellation reason: test booking)
- Client reference: TELI_1780472074018
