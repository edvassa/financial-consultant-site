# API Documentation

**Base URL:** https://finconsult-turcanelena.manus.space

---

## Critical Endpoints

### Blog OG Tags (CRITICAL FOR SOCIAL MEDIA)

**Endpoint:** `GET /api/blog/og/:slug`

**Purpose:** Returns minimal HTML with OG tags for social media crawlers. This endpoint is NOT intercepted by Manus proxy.

**Parameters:**
- `slug` (string, required) - Article slug (e.g., "dae", "infleatia")

**Response:** HTML with OG meta tags

**Example:**
```bash
curl https://finconsult-turcanelena.manus.space/api/blog/og/dae
```

**Response:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="Article Title" />
  <meta property="og:description" content="Article description" />
  <meta property="og:image" content="https://..." />
  <meta property="og:url" content="https://finconsult-turcanelena.manus.space/blog/dae" />
  <meta property="og:type" content="article" />
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <script>
    // Meta refresh redirect to actual blog page
    window.location.href = 'https://finconsult-turcanelena.manus.space/blog/dae';
  </script>
</body>
</html>
```

**Why This Works:**
- `/api/*` routes are NOT intercepted by Manus proxy
- og:url is hardcoded (no `?manus_scraper=1`)
- Social media crawlers read OG tags
- Then redirect to actual blog page
- Users see the article, crawlers see correct preview

**Testing:**
```bash
# Test with Facebook bot
curl -s "https://finconsult-turcanelena.manus.space/api/blog/og/dae" \
  -H "User-Agent: facebookexternalhit/1.1" | grep og:url

# Should show:
# <meta property="og:url" content="https://finconsult-turcanelena.manus.space/blog/dae" />
# (NO ?manus_scraper=1)
```

---

## Blog Endpoints

### List All Articles

**Endpoint:** `GET /api/blog/list`

**Purpose:** Get list of all blog articles

**Response:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "slug": "dae",
      "title": "Article Title",
      "description": "Short description",
      "image": "https://...",
      "createdAt": "2026-04-01T00:00:00Z"
    }
  ]
}
```

### Get Single Article

**Endpoint:** `GET /api/blog/article/:slug`

**Parameters:**
- `slug` (string, required) - Article slug

**Response:**
```json
{
  "id": "uuid",
  "slug": "dae",
  "title": "Article Title",
  "content": "Full article content in HTML",
  "description": "SEO description",
  "image": "https://...",
  "author": "Author Name",
  "createdAt": "2026-04-01T00:00:00Z",
  "updatedAt": "2026-04-01T00:00:00Z"
}
```

### Create Article (Admin Only)

**Endpoint:** `POST /api/blog/create`

**Authentication:** Required (admin role)

**Body:**
```json
{
  "title": "Article Title",
  "slug": "article-slug",
  "content": "Article content",
  "description": "SEO description",
  "image": "https://...",
  "author": "Author Name"
}
```

### Update Article (Admin Only)

**Endpoint:** `PUT /api/blog/update/:slug`

**Authentication:** Required (admin role)

**Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "description": "Updated description",
  "image": "https://..."
}
```

### Delete Article (Admin Only)

**Endpoint:** `DELETE /api/blog/delete/:slug`

**Authentication:** Required (admin role)

---

## Authentication Endpoints

### Get Current User

**Endpoint:** `GET /api/auth/me`

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "user",
  "createdAt": "2026-04-01T00:00:00Z"
}
```

### Login

**Endpoint:** Manus OAuth (handled automatically)

**URL:** `https://finconsult-turcanelena.manus.space/api/oauth/callback`

### Logout

**Endpoint:** `POST /api/auth/logout`

**Response:**
```json
{
  "success": true
}
```

---

## Product Endpoints

### List Products

**Endpoint:** `GET /api/products/list`

**Query Parameters:**
- `category` (optional) - Filter by category
- `limit` (optional, default: 20) - Results per page
- `offset` (optional, default: 0) - Pagination offset

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "Description",
      "price": 99.99,
      "category": "digital",
      "image": "https://...",
      "createdAt": "2026-04-01T00:00:00Z"
    }
  ],
  "total": 12
}
```

### Get Single Product

**Endpoint:** `GET /api/products/:id`

**Response:**
```json
{
  "id": "uuid",
  "name": "Product Name",
  "description": "Full description",
  "price": 99.99,
  "category": "digital",
  "image": "https://...",
  "fileUrl": "https://..." // For digital products
}
```

---

## Consultation Booking Endpoints

### Create Booking

**Endpoint:** `POST /api/consultations/book`

**Body:**
```json
{
  "name": "Client Name",
  "email": "client@example.com",
  "phone": "+1234567890",
  "message": "Consultation request message",
  "preferredDate": "2026-04-15",
  "preferredTime": "14:00"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "pending",
  "createdAt": "2026-04-01T00:00:00Z"
}
```

### List Bookings (Admin Only)

**Endpoint:** `GET /api/consultations/list`

**Authentication:** Required (admin role)

**Response:**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "name": "Client Name",
      "email": "client@example.com",
      "phone": "+1234567890",
      "message": "Message",
      "preferredDate": "2026-04-15",
      "preferredTime": "14:00",
      "status": "pending",
      "createdAt": "2026-04-01T00:00:00Z"
    }
  ]
}
```

### Update Booking Status (Admin Only)

**Endpoint:** `PUT /api/consultations/:id/status`

**Authentication:** Required (admin role)

**Body:**
```json
{
  "status": "confirmed" // or "completed", "cancelled"
}
```

---

## Newsletter Endpoints

### Subscribe

**Endpoint:** `POST /api/newsletter/subscribe`

**Body:**
```json
{
  "email": "subscriber@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed"
}
```

### Unsubscribe

**Endpoint:** `POST /api/newsletter/unsubscribe`

**Body:**
```json
{
  "email": "subscriber@example.com"
}
```

---

## Order Endpoints

### Create Order

**Endpoint:** `POST /api/orders/create`

**Authentication:** Required

**Body:**
```json
{
  "productId": "uuid",
  "quantity": 1,
  "paymentMethod": "stripe" // or other methods
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "pending",
  "total": 99.99,
  "createdAt": "2026-04-01T00:00:00Z"
}
```

### Get Order

**Endpoint:** `GET /api/orders/:id`

**Authentication:** Required

**Response:**
```json
{
  "id": "uuid",
  "productId": "uuid",
  "quantity": 1,
  "total": 99.99,
  "status": "completed",
  "createdAt": "2026-04-01T00:00:00Z"
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Permission denied |
| `INVALID_INPUT` | 400 | Invalid request data |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

- **Public endpoints:** 100 requests per minute per IP
- **Authenticated endpoints:** 1000 requests per minute per user
- **Admin endpoints:** No limit

---

## CORS

**Allowed Origins:**
- https://finconsult-turcanelena.manus.space
- https://finconsult-cp4pzg8z.manus.space

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers:** Content-Type, Authorization

---

## Authentication

### Bearer Token

All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

Token is obtained via Manus OAuth and stored in session cookie.

### Session Cookie

Session cookie is automatically set on login:
```
Set-Cookie: session=<jwt_token>; HttpOnly; Secure; SameSite=Strict
```

---

## Pagination

For endpoints that return lists:

**Query Parameters:**
- `limit` (optional, default: 20, max: 100) - Results per page
- `offset` (optional, default: 0) - Number of items to skip

**Response:**
```json
{
  "items": [...],
  "total": 150,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

---

## Testing Endpoints

### Using curl

```bash
# Get article list
curl https://finconsult-turcanelena.manus.space/api/blog/list

# Get single article
curl https://finconsult-turcanelena.manus.space/api/blog/article/dae

# Get OG tags
curl https://finconsult-turcanelena.manus.space/api/blog/og/dae

# Get OG tags with Facebook bot user-agent
curl -H "User-Agent: facebookexternalhit/1.1" \
  https://finconsult-turcanelena.manus.space/api/blog/og/dae
```

### Using JavaScript/Fetch

```javascript
// Get article list
const response = await fetch('/api/blog/list');
const data = await response.json();

// Get single article
const article = await fetch('/api/blog/article/dae');
const articleData = await article.json();
```

---

## Webhook Endpoints

Currently no webhooks configured. Contact support to add webhook functionality.

---

## API Versioning

Current API version: **v1**

All endpoints are under `/api/` prefix.

Future versions will use `/api/v2/`, `/api/v3/`, etc.

---

**Last Updated:** April 6, 2026

**For issues or questions:** https://help.manus.im
