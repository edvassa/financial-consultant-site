# FinConsult Project - Critical Rules

**NEVER BREAK THESE RULES**

---

## Golden Rules

### 1. Social Media OG Tags - CRITICAL

**Problem:** Manus proxy adds `?manus_scraper=1` to `/blog/:slug` requests, breaking social media previews.

**Solution:** Use `/api/blog/og/:slug` endpoint for ALL social media links.

**RULE:**
```
✅ CORRECT:   https://finconsult-turcanelena.manus.space/api/blog/og/[slug]
❌ WRONG:     https://finconsult-turcanelena.manus.space/blog/[slug]
```

**Why:** `/api/blog/*` routes are NOT intercepted by Manus proxy, so og:url stays clean.

### 2. og:url Must ALWAYS Be Hardcoded

**WRONG - NEVER DO THIS:**
```typescript
const url = req.url;              // ❌ Proxy adds ?manus_scraper=1
const url = req.originalUrl;      // ❌ Still modified by proxy
const url = `${protocol}://${host}/blog/${slug}`;  // ❌ Dynamic
```

**CORRECT - ALWAYS DO THIS:**
```typescript
const SITE_URL = "https://finconsult-turcanelena.manus.space";
const url = `${SITE_URL}/blog/${slug}`;  // ✅ Hardcoded, clean
```

**Rule:** og:url must be built from hardcoded SITE_URL + article slug from database ONLY.

### 3. Never Use Request-Based URLs for og:url

**NEVER use these for og:url:**
- `req.url`
- `req.originalUrl`
- `req.headers.host`
- `req.protocol`
- `req.get('host')`
- Any dynamic URL from request object

**WHY:** Manus proxy modifies these before Express sees them.

### 4. Middleware Order Matters

**Middleware must run in this order:**
1. Strip `?manus_scraper=1` parameter (if added)
2. Parse request body
3. Authentication
4. Route handlers

**NEVER** put route handlers before middleware.

### 5. Always Test Before Deploying

**Required tests before creating checkpoint:**
```bash
# Test with Facebook bot
curl -s "https://finconsult-turcanelena.manus.space/api/blog/og/dae" \
  -H "User-Agent: facebookexternalhit/1.1" | grep og:url

# Expected output (NO ?manus_scraper=1):
# <meta property="og:url" content="https://finconsult-turcanelena.manus.space/blog/dae" />
```

### 6. Always Create Checkpoint Before Publishing

**Process:**
1. Make changes
2. Test locally: `pnpm dev`
3. Create checkpoint in Management UI with description
4. Click "Publish" button
5. Wait 60 seconds
6. Verify on production
7. Update CURRENT_CHECKPOINT.md

**NEVER** deploy without checkpoint.

### 7. Never Use `git reset --hard`

**WRONG:**
```bash
git reset --hard HEAD~1  # ❌ NEVER DO THIS
```

**CORRECT:**
```bash
# Use rollback in Management UI instead
# Or use: git revert HEAD
```

### 8. Never Edit `server/_core/` Files

**These are framework-level files:**
- `server/_core/index.ts` - Main server setup
- `server/_core/vite.ts` - Vite integration
- `server/_core/context.ts` - tRPC context
- `server/_core/cookies.ts` - Session management

**ONLY edit if:**
- You understand the entire framework
- You have tested thoroughly
- You have created a checkpoint first

### 9. Never Touch What's Already Working

**Before making changes:**
1. Read CURRENT_CHECKPOINT.md
2. Understand what's working
3. Only change what needs to be changed
4. Test that you didn't break anything else

### 10. Always Update Documentation After Changes

**After deploying:**
1. Update CURRENT_CHECKPOINT.md with new checkpoint ID
2. Update RULES.md if you discovered new rules
3. Update API.md if you added/changed endpoints
4. Update STRUCTURE.md if you changed folder structure
5. Commit to git

---

## Code Rules

### Database

- ✅ Always use Drizzle ORM for queries
- ✅ Always use `pnpm db:push` to apply migrations
- ❌ NEVER use raw SQL for schema changes
- ❌ NEVER store file bytes in database (use S3 instead)

### API Routes

- ✅ Use tRPC procedures for all API calls
- ✅ Use `publicProcedure` for public endpoints
- ✅ Use `protectedProcedure` for authenticated endpoints
- ❌ NEVER create REST routes (use tRPC instead)

### Frontend

- ✅ Use `trpc.*.useQuery/useMutation` for all data
- ✅ Use shadcn/ui components for UI
- ✅ Use Tailwind CSS for styling
- ❌ NEVER use fetch/axios directly
- ❌ NEVER hardcode API URLs

### File Storage

- ✅ Use S3 for all file storage (via `storagePut`)
- ✅ Save metadata (URL, path, owner) in database
- ❌ NEVER store files in `client/public` for dynamic content
- ❌ NEVER store files in local filesystem

---

## Deployment Rules

### Before Deploying

- ✅ All tests pass: `pnpm test`
- ✅ No TypeScript errors: `pnpm check`
- ✅ Code is formatted: `pnpm format`
- ✅ Tested locally: `pnpm dev`
- ✅ Tested on production domain
- ✅ Created checkpoint with description
- ❌ NEVER deploy with uncommitted changes
- ❌ NEVER deploy without testing

### After Deploying

- ✅ Wait 60 seconds for deployment
- ✅ Verify on production domain
- ✅ Check Management UI dashboard
- ✅ Update CURRENT_CHECKPOINT.md
- ✅ Commit documentation changes

### If Something Breaks

- ✅ Check logs in Management UI
- ✅ Review recent changes
- ✅ Use rollback to previous checkpoint
- ✅ Fix the issue
- ✅ Create new checkpoint
- ✅ Deploy again

---

## Social Media Rules

### For Blog Article Links

**When sharing on Facebook/LinkedIn/Twitter:**

```
Use this URL:
https://finconsult-turcanelena.manus.space/api/blog/og/[slug]

NOT this:
https://finconsult-turcanelena.manus.space/blog/[slug]
```

### For OG Tags

**Always include:**
- `og:title` - Article title
- `og:description` - Article summary
- `og:image` - Featured image
- `og:url` - Hardcoded clean URL (NO parameters)
- `og:type` - "article"

**Verify with:**
- Facebook Debugger: https://developers.facebook.com/tools/debug
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

---

## Testing Rules

### Before Every Deployment

```bash
# 1. Unit tests
pnpm test

# 2. Type checking
pnpm check

# 3. Build
pnpm build

# 4. Dev server
pnpm dev

# 5. Manual testing
# - Test blog article display
# - Test /api/blog/og/:slug endpoint
# - Test social media preview
```

### Social Media Testing

```bash
# Test /api/blog/og/dae with Facebook bot
curl -s "https://finconsult-turcanelena.manus.space/api/blog/og/dae" \
  -H "User-Agent: facebookexternalhit/1.1" | grep -E "og:url|og:title|og:image"

# Expected:
# og:url = https://finconsult-turcanelena.manus.space/blog/dae (NO ?manus_scraper=1)
# og:title = Article title
# og:image = Image URL
```

---

## When Something Goes Wrong

### OG Tags Not Working

1. Check if using `/api/blog/og/:slug` (not `/blog/:slug`)
2. Verify og:url is hardcoded (not from req.url)
3. Test with Facebook Debugger
4. Check server logs in Management UI
5. Rollback to previous checkpoint if needed

### Blog Not Showing

1. Check database connection
2. Verify articles exist in database
3. Check `/api/blog/list` endpoint
4. Review TypeScript errors: `pnpm check`
5. Check server logs

### Deployment Failed

1. Check Management UI dashboard
2. Review recent commits
3. Check for TypeScript errors
4. Try rollback to previous checkpoint
5. Contact Manus support if needed

### Dev Server Won't Start

```bash
# Kill any running processes
pkill -f "tsx watch"
pkill -f "vite"

# Clear cache
rm -rf .vite dist node_modules/.vite

# Restart
pnpm dev
```

---

## Checkpoint Rules

### When to Create Checkpoint

- ✅ After completing a feature
- ✅ Before major changes
- ✅ Before deploying to production
- ✅ When fixing a critical bug
- ✅ When updating dependencies

### Checkpoint Description Format

```
[FEATURE/FIX/DOCS]: Brief description

Detailed explanation of what changed:
- Item 1
- Item 2
- Item 3

Testing done:
- Test 1
- Test 2
```

### Example

```
[FIX]: Fixed og:url bug in blog SSR

- Replaced dynamic protocol/host variables with hardcoded SITE_URL
- og:url now uses: https://finconsult-turcanelena.manus.space/blog/${slug}
- Canonical link header also hardcoded
- Tested with Facebook bot user-agent

Testing:
- curl with facebookexternalhit user-agent
- Verified og:url has no ?manus_scraper=1
- Tested on production domain
```

---

## Git Rules

### Commit Messages

```
[TYPE]: Brief description

- Detailed change 1
- Detailed change 2

Checkpoint: [ID if applicable]
```

### Types

- `[FEATURE]` - New feature
- `[FIX]` - Bug fix
- `[DOCS]` - Documentation
- `[REFACTOR]` - Code refactoring
- `[PERF]` - Performance improvement
- `[TEST]` - Test changes

### Never

- ❌ `git reset --hard`
- ❌ `git push --force`
- ❌ Commit large files (use S3 instead)
- ❌ Commit secrets or API keys

---

## Environment Variables

### Never Hardcode These

- API keys
- Database passwords
- OAuth secrets
- JWT secrets

### Always Use

- Environment variables via `webdev_request_secrets`
- `.env` file (never commit)
- Manus secrets management

---

## Performance Rules

### Frontend

- ✅ Use React.memo for expensive components
- ✅ Use useMemo for expensive calculations
- ✅ Lazy load routes with React.lazy
- ✅ Optimize images (use CDN URLs)
- ❌ NEVER create new objects in render
- ❌ NEVER use inline functions in props

### Backend

- ✅ Use database indexes for queries
- ✅ Cache frequently accessed data
- ✅ Use pagination for large lists
- ❌ NEVER do N+1 queries
- ❌ NEVER process large files in memory

### Database

- ✅ Add indexes to frequently queried columns
- ✅ Use LIMIT for large result sets
- ✅ Archive old data regularly
- ❌ NEVER store large files
- ❌ NEVER run expensive queries on production

---

## Security Rules

- ✅ Always validate user input
- ✅ Always use HTTPS
- ✅ Always check user role before admin operations
- ✅ Always sanitize HTML output
- ❌ NEVER trust client-side validation
- ❌ NEVER expose API keys to frontend
- ❌ NEVER log sensitive data

---

## Summary

**The 3 Most Important Rules:**

1. **Use `/api/blog/og/:slug` for social media links** - NEVER use `/blog/:slug`
2. **Always hardcode og:url** - NEVER use req.url or req.originalUrl
3. **Always create checkpoint before deploying** - NEVER deploy without checkpoint

**If you remember nothing else, remember these 3 rules.**

---

**Last Updated:** April 6, 2026

**Review this file before making ANY changes to the project.**
