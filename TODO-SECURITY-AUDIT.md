# Security Audit - DDLP Application

**Date:** 2026-02-02
**Status:** Pending fixes

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 6 | [ ] Pending |
| High | 5 | [ ] Pending |
| Medium | 4 | [ ] Pending |

---

## CRITICAL - Fix Immediately

### [ ] 1. Permissive RLS Policies
All tables use `USING (true) WITH CHECK (true)` allowing anyone to read/write all data.

**Affected files:**
- `supabase/migrations/20260131000003_rls_policies.sql`
- `supabase/migrations/20260131000004_comercios_table.sql`
- `supabase/migrations/20260131000006_discounts_table.sql`
- `supabase/migrations/20260131000007_raffles_table.sql`

**Tables at risk:**
- `members` - PII: national IDs, tax IDs, emails, phones
- `comercios` - Business data
- `discounts` - Discount records
- `raffles` - Includes secret codes
- `raffle_participants` - Names and WhatsApp numbers

**Fix:** Create new migration with proper policies restricting access based on authentication.

---

### [ ] 2. No Authorization Layer
`middleware.ts` only checks if user is authenticated, not their role.

**File:** `middleware.ts:3-8`

**Risk:** Any authenticated Clerk user can access all admin routes.

**Fix:** Add role-based access control using Clerk publicMetadata or sessionClaims.

---

### [ ] 3. Client-Side Database Access
All database operations happen in the browser, exposing logic and data.

**Affected files:**
- `app/admin/socios/page.tsx` - Member CRUD
- `app/admin/comercios/page.tsx` - Comercio management
- `app/admin/sorteos/page.tsx` - Raffle management

**Fix:** Move sensitive operations to Next.js Server Actions.

---

### [ ] 4. Sensitive Data Exposed in Admin UI
National IDs, tax IDs, emails, phone numbers displayed without masking.

**File:** `app/admin/socios/page.tsx:400-476`

**Fix:** Mask sensitive fields and require explicit reveal action.

---

### [ ] 5. No Input Validation
Direct FormData to database without validation.

**Examples:**
- `app/admin/socios/page.tsx:94-134`
- `app/comercio/[slug]/page.tsx:122-131`

**Fix:** Add Zod schema validation for all inputs.

---

### [ ] 6. Missing Security Headers
`next.config.ts` is empty - no protection against XSS, clickjacking.

**File:** `next.config.ts`

**Fix:** Add headers configuration:
```typescript
headers: async () => [{
  source: '/(.*)',
  headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' }
  ]
}]
```

---

## HIGH - Fix Soon

### [ ] 7. Secret Codes in URL
Raffle codes passed as `?code=<UUID>` - visible in browser history.

**File:** `app/comercio/[slug]/page.tsx:97`

**Fix:** Use POST request or session-based validation.

---

### [ ] 8. No Rate Limiting
Unlimited raffle registrations per WhatsApp.

**File:** `app/comercio/[slug]/page.tsx:122-131`

**Fix:** Implement rate limiting + CAPTCHA.

---

### [ ] 9. No CSRF Protection
Forms submit without CSRF tokens.

**Fix:** Use Server Actions (built-in CSRF protection).

---

### [ ] 10. No Phone Validation
WhatsApp numbers stored without format validation.

**File:** `app/comercio/[slug]/page.tsx:127`

**Fix:** Validate phone format before insertion.

---

### [ ] 11. No Audit Logging
Admin operations not logged.

**Fix:** Add logging for sensitive admin actions.

---

## MEDIUM - Address When Possible

### [ ] 12. URL Validation Missing
Logo URLs not validated before storage/render.

**Files:**
- `app/admin/comercios/new/page.tsx`
- `app/admin/comercios/[id]/page.tsx`

---

### [ ] 13. No .env.example
No template for required environment variables.

---

### [ ] 14. Select * Queries
Fetching unnecessary columns including sensitive data.

---

### [ ] 15. Error Message Leakage
Database errors may be exposed to client.

---

## Positive Findings

- [x] Environment files NOT in git
- [x] Clerk auth properly configured
- [x] Parameterized queries (no SQL injection)
- [x] No file upload functionality
- [x] Dependencies are current

---

## Implementation Order

**Phase 1 (Immediate):**
1. Security headers in next.config.ts
2. New RLS migration with proper policies
3. Role-based auth in middleware

**Phase 2 (Short-term):**
4. Convert admin pages to Server Actions
5. Add Zod validation
6. Rate limiting + CAPTCHA

**Phase 3 (Medium-term):**
7. Audit logging
8. Mask sensitive data
9. Session-based raffle codes
