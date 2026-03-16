# Ezra — Security & Integration Testing (Q2)

**Feature:** Medical Data Privacy — Prevention of Cross-Member Data Access  
**Environment:** https://myezra-staging.ezra.com  
**Date:** 2026-03-16

---

## Test Accounts (Staging — Real Data)

| | Member A (Token A) | Member B (Token B) |
|--|--|--|
| **Name** | Kate Vnuk | Kate Vnuk Member B test |
| **Email** | kate.kuril@gmail.com | kate.vnuk85@gmail.com |
| **User ID** | `05d33217-790c-4d27-b1e6-e15dc505ebe3` | `0da0f7bd-9495-448f-ab5f-d9e7c3bc83c1` |
| **Member ID** | `#7518` | `#7520` |
| **encounterId** | `efc07b8d-ffad-4f67-93b4-edab5591a09d` | `8870e966-a8cc-40d5-9953-5e62f0f1d49d` |

---

## Part 1 — Integration Test Case

### Test Case SEC-01 — Member A cannot access Member B's medical questionnaire via IDOR

| Field | Details |
|-------|---------|
| **Test ID** | SEC-01 |
| **Title** | Member A cannot read or modify Member B's medical questionnaire by substituting their encounterId |
| **Type** | Integration / Security — Broken Access Control |
| **Vulnerability** | Insecure Direct Object Reference (IDOR) |
| **OWASP Category** | A01:2021 — Broken Access Control |
| **Priority** | Critical |
| **Data at Risk** | PHI: name, DOB, address, ethnicity, height/weight, government ID photo, medical/cancer history, MRI safety implants |

### Pre-conditions
1. Member A (`kate.kuril@gmail.com`, `#7518`) is authenticated with `token_A`
2. Member B (`kate.vnuk85@gmail.com`, `#7520`) has encounterId `8870e966-a8cc-40d5-9953-5e62f0f1d49d`
3. Both JWT Bearer tokens available from DevTools Network tab

### Test Steps

**Step 1 — Baseline: Member A accesses own questionnaire (should succeed)**
1. Log in as Member A
2. Navigate to: `https://myezra-staging.ezra.com/medical-questionnaire?flow=medical-questionnaire&direct=true&clearData=true&extraData={"encounterId":"efc07b8d-ffad-4f67-93b4-edab5591a09d"}`
3. Verify questionnaire loads with Kate Vnuk's data (DOB: 1985-02-22, Aventura FL)

**Step 2 — IDOR via URL manipulation**
1. While authenticated as Member A, replace encounterId with Member B's:
`https://myezra-staging.ezra.com/medical-questionnaire?flow=medical-questionnaire&direct=true&clearData=true&extraData={"encounterId":"8870e966-a8cc-40d5-9953-5e62f0f1d49d"}`
2. Observe whether Member B's PHI loads or 403 is returned

**Step 3 — IDOR via direct API calls**
1. Using token_A, send HTTP requests (see Part 2) targeting Member B's encounterId
2. Attempt GET, PUT, PATCH

**Step 4 — Verify integrity**
1. Log back in as Member B and confirm responses are unchanged

### Expected Results

| Action | Token Used | Target encounterId | Expected | Pass Criteria |
|--------|-----------|-------------------|----------|--------------|
| Member A reads own questionnaire | `token_A` (Member A #7518) | `efc07b8d-ffad-4f67-93b4-edab5591a09d` (Member A) | `200 OK` | Member A own PHI loads correctly |
| Member A reads Member B questionnaire via URL | `token_A` (Member A #7518) | `8870e966-a8cc-40d5-9953-5e62f0f1d49d` (Member B) | `403 Forbidden` | No Member B PHI returned |
| GET API — Member A reads Member B encounter | `token_A` (Member A #7518) | `8870e966-a8cc-40d5-9953-5e62f0f1d49d` (Member B) | `403 Forbidden` | Empty error body, zero PHI |
| PUT API — Member A writes to Member B encounter | `token_A` (Member A #7518) | `8870e966-a8cc-40d5-9953-5e62f0f1d49d` (Member B) | `403 Forbidden` | No Member B data modified |
| No token | none | `8870e966-a8cc-40d5-9953-5e62f0f1d49d` (Member B) | `401 Unauthorized` | No data returned |
| Tampered token | invalid | `8870e966-a8cc-40d5-9953-5e62f0f1d49d` (Member B) | `401 Unauthorized` | No data returned |

**PASS** — All cross-member requests return 403 with no PHI  
**FAIL** — Any 200 with Member B's data, or 404 leaking existence, or silent redirect

---

## Part 2 — HTTP Requests

> Real encounterId values confirmed from staging environment.  
> Token A is real (expires in 599s — refresh if needed).  
> API base path: confirm exact path from DevTools Network → Fetch/XHR.

### Request 1 — Baseline: Member A reads own encounter (200 OK expected)

```http
GET /api/v1/encounters/efc07b8d-ffad-4f67-93b4-edab5591a09d HTTP/1.1
Host: myezra-staging.ezra.com
Authorization: Bearer eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwidHlwIjoiYXQrand0IiwiY3R5IjoiSldUIn0.fXiAq8nynjKPndhH2oNjZuiAwk8hFB_oa5IZvlMjiUQOwiFgnu8nsE6STZ4PmHi7MKggCuQNfZyCFQFTRY525UHAC4nXYb-E.DT3OSktU5YsQJb9b6F5dOQ...
Accept: application/json
```

Expected: `200 OK` with Kate Vnuk's own PHI (memberId: `05d33217-790c-4d27-b1e6-e15dc505ebe3`)

---

### Request 2 — IDOR read: Member A reads Member B's encounter (403 expected)

```http
GET /api/v1/encounters/8870e966-a8cc-40d5-9953-5e62f0f1d49d HTTP/1.1
Host: myezra-staging.ezra.com
Authorization: Bearer eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwidHlwIjoiYXQrand0IiwiY3R5IjoiSldUIn0.fXiAq8nynjKPndhH2oNjZuiAwk8hFB_oa5IZvlMjiUQOwiFgnu8nsE6STZ4PmHi7MKggCuQNfZyCFQFTRY525UHAC4nXYb-E.DT3OSktU5YsQJb9b6F5dOQ...
Accept: application/json
```

**Expected response:**
```json
HTTP/1.1 403 Forbidden
{
  "error": "forbidden",
  "message": "You do not have permission to access this resource."
}
```

**Bug scenario (HIPAA violation):** If `200 OK` is returned with `memberId: 0da0f7bd-9495-448f-ab5f-d9e7c3bc83c1` and PHI — Member A has full access to Member B's medical data.

---

### Request 3 — IDOR write: Member A overwrites Member B's responses (403 expected)

```http
PUT /api/v1/encounters/8870e966-a8cc-40d5-9953-5e62f0f1d49d/responses HTTP/1.1
Host: myezra-staging.ezra.com
Authorization: Bearer eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwidHlwIjoiYXQrand0IiwiY3R5IjoiSldUIn0...
Content-Type: application/json

{
  "medical_conditions": false,
  "cancer_history": false,
  "has_pacemaker": false,
  "has_implants": false
}
```

**Expected:** `403 Forbidden` — no data modified

---

### Request 4 — Unauthenticated (401 expected)

```http
GET /api/v1/encounters/8870e966-a8cc-40d5-9953-5e62f0f1d49d HTTP/1.1
Host: myezra-staging.ezra.com
Accept: application/json
```

**Expected:** `401 Unauthorized`

---

### Request 5 — Tampered token (401 expected)

```http
GET /api/v1/encounters/8870e966-a8cc-40d5-9953-5e62f0f1d49d HTTP/1.1
Host: myezra-staging.ezra.com
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.TAMPERED.INVALID
Accept: application/json
```

**Expected:** `401 Unauthorized`

---

### Request 6 — Government ID document IDOR (403 expected)

```http
GET /api/v1/encounters/8870e966-a8cc-40d5-9953-5e62f0f1d49d/documents/government-id HTTP/1.1
Host: myezra-staging.ezra.com
Authorization: Bearer eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwidHlwIjoiYXQrand0IiwiY3R5IjoiSldUIn0...
Accept: application/json
```

**Expected:** `403 Forbidden` — government ID photos must be protected with same ownership checks

---

## Part 3 — Managing Security Quality Across 100+ Sensitive Endpoints

### Strategy: Defense in Depth — 4 Layers

#### Layer 1 — Automated IDOR Tests in CI/CD (highest ROI)

Every PR triggers a security test suite that creates two member accounts, authenticates both, and sends cross-member requests to every sensitive endpoint pattern asserting `403` for all cross-member access.

**Tradeoff:** High setup cost. Without this, a single PR removing one ownership check exposes all 100+ endpoints.

---

#### Layer 2 — Centralized Authorization Middleware

All routes under `/api/v1/encounters/*`, `/api/v1/members/*`, `/api/v1/documents/*` are gated by a single `verifyOwnership(token, resourceId)` function that extracts `memberId` from the JWT and rejects mismatches with `403`. New endpoints inherit protection automatically.

**Tradeoff:** Requires architectural discipline. A bug in middleware affects all endpoints — it must be the most heavily tested component.

---

#### Layer 3 — Security Checklist on Every PR

- [ ] Does this endpoint verify the authenticated user owns the resource?
- [ ] Does it return `403` (not `404`) for unauthorized access?
- [ ] Is the response body empty of PHI on error?
- [ ] Is there an automated test covering this endpoint?

**Tradeoff:** Low cost, high value. Must be backed by Layer 1 automation.

---

#### Layer 4 — Quarterly Pen Testing + Bug Bounty

External pen test every quarter + private bug bounty for the member portal. Catches logic-level vulnerabilities that automated tests miss.

**Tradeoff:** Expensive and infrequent — not a substitute for Layers 1–3.

---

### Risks Summary

| Risk | Mitigation |
|------|-----------|
| New endpoint without auth check | Layer 1 CI catches before merge |
| JWT token theft | Short expiry (599s confirmed), HTTPS-only, httpOnly cookies |
| encounterId enumeration | UUIDs in use — confirmed in staging |
| Government ID via direct storage URL | Pre-signed URLs with short TTL + ownership check |
| Staging contains real PHI | Staging must use synthetic data only |

---

### Key Principle

Authorization must be enforced **server-side, on every request, for every resource**. UUID-based `encounterId` already prevents enumeration. Every endpoint accepting a UUID must validate ownership before returning or mutating data.

---

> **Bonus security finding:** A member account exists with name `<script>alert('XSS');</script> ' UNION SELECT NULL, NULL, @@version;--`. XSS appears sanitized correctly. However, SQL injection attempts in name fields should trigger security alerts and be logged for the security team regardless of success.
