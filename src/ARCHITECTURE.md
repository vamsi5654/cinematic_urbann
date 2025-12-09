# 🏗️ Architecture Overview - The Urbann

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                     (React Application)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP Requests
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   CLOUDFLARE PAGES                           │
│                  (Static Site Hosting)                       │
│  • Serves React app (HTML, CSS, JS)                         │
│  • Global CDN distribution                                   │
│  • SSL/TLS certificates                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ API Calls (/api/*)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  CLOUDFLARE WORKERS                          │
│                    (Serverless API)                          │
│  • /api/auth/login    - Authentication                      │
│  • /api/upload        - Image uploads                       │
│  • /api/images        - Fetch images                        │
│  • /api/images/:id    - Update/Delete                       │
└─────────┬─────────────────────────────┬────────────────────┘
          │                             │
          │ Query/Write                 │ Store/Retrieve
          │                             │
┌─────────▼──────────────┐    ┌─────────▼──────────────┐
│   CLOUDFLARE D1        │    │   CLOUDFLARE R2        │
│   (SQL Database)       │    │   (Object Storage)     │
│                        │    │                        │
│  Tables:               │    │  • Image files         │
│  • images              │    │  • JPG, PNG, WEBP      │
│  • projects            │    │  • Public URLs         │
│  • admin_users         │    │                        │
│  • project_images      │    │                        │
└────────────────────────┘    └────────────────────────┘
```

---

## 🔄 Data Flow

### Upload Image Flow

```
1. Admin uploads image via /admin
   ↓
2. Frontend sends FormData to /api/upload
   ↓
3. Worker authenticates request (JWT)
   ↓
4. Worker uploads file to R2 bucket
   ↓
5. R2 returns file URL
   ↓
6. Worker saves metadata to D1 database
   ↓
7. Worker returns success + image data
   ↓
8. Frontend updates UI with new image
```

### View Gallery Flow

```
1. User visits /gallery
   ↓
2. Frontend calls /api/images?status=published
   ↓
3. Worker queries D1 database
   ↓
4. D1 returns image metadata with R2 URLs
   ↓
5. Worker returns JSON response
   ↓
6. Frontend displays images from R2 URLs
   ↓
7. Cloudflare CDN caches images globally
```

### Admin Login Flow

```
1. Admin enters credentials at /admin
   ↓
2. Frontend sends POST to /api/auth/login
   ↓
3. Worker queries admin_users table in D1
   ↓
4. Worker verifies password hash
   ↓
5. Worker generates JWT token
   ↓
6. Frontend stores token in localStorage
   ↓
7. Future requests include token in Authorization header
```

---

## 📂 Directory Structure

```
the-urbann/
├── src/
│   ├── App.tsx                    # Main app with routing
│   ├── main.tsx                   # Entry point
│   └── services/
│       └── api.ts                 # API client (fetch wrappers)
│
├── pages/                         # Page components
│   ├── Home.tsx                   # Landing page
│   ├── Gallery.tsx                # Project gallery (public)
│   ├── ProjectDetail.tsx          # Project details
│   ├── Services.tsx               # Services page
│   ├── About.tsx                  # About page
│   ├── Contact.tsx                # Contact form
│   └── Admin.tsx                  # Admin dashboard (protected)
│
├── components/                    # Reusable components
│   ├── Header.tsx                 # Navigation header
│   ├── Footer.tsx                 # Site footer
│   ├── Topbar.tsx                 # Top announcement bar
│   └── Button.tsx                 # Button component
│
├── styles/
│   ├── globals.css               # Global styles & design tokens
│   └── *.module.css              # CSS Modules for components
│
├── functions/                    # Cloudflare Workers (API)
│   └── api/
│       └── [[path]].ts           # Catch-all API handler
│
├── database/
│   └── schema.sql                # D1 database schema
│
├── public/                       # Static assets
├── wrangler.toml                # Cloudflare Workers config
├── package.json                 # Dependencies
└── vite.config.js              # Vite build config
```

---

## 🔐 Authentication Flow

### JWT Token Structure

```json
{
  "userId": "admin-001",
  "username": "admin",
  "exp": 1234567890000  // Expiration timestamp
}
```

### Protected Routes

All `/api/*` routes except `/api/images` (GET) require authentication:

```typescript
Authorization: Bearer <jwt-token>
```

Token is:
1. Generated on login
2. Stored in `localStorage`
3. Sent with every authenticated request
4. Validated by Worker before processing

---

## 💾 Database Schema

### Images Table
```sql
images (
  id TEXT PRIMARY KEY,
  public_id TEXT UNIQUE,        -- R2 filename
  image_url TEXT,                -- Full R2 URL
  customer_name TEXT,
  phone TEXT,
  category TEXT,                 -- Kitchen, Living, etc.
  tags TEXT,                     -- JSON array
  description TEXT,
  status TEXT,                   -- 'draft' or 'published'
  uploaded_by TEXT,
  uploaded_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Projects Table
```sql
projects (
  id TEXT PRIMARY KEY,
  title TEXT,
  category TEXT,
  location TEXT,
  year TEXT,
  area TEXT,
  materials TEXT,               -- JSON array
  description TEXT,
  tags TEXT,                    -- JSON array
  featured BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Admin Users Table
```sql
admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  password_hash TEXT,           -- bcrypt hash
  email TEXT,
  role TEXT,
  created_at TIMESTAMP,
  last_login TIMESTAMP
)
```

---

## 🎨 Frontend State Management

### Admin Page State
- `images[]` - List of all images
- `loading` - Loading state
- `error` - Error messages
- `showUploadModal` - Upload modal visibility
- `showLoginModal` - Login modal visibility
- `uploadForm` - Form data for new uploads
- `selectedFile` - File to upload
- `uploadProgress` - Upload progress (0-100)

### Gallery Page State
- `projects[]` - List of projects (converted from images)
- `selectedCategory` - Current filter
- `loading` - Loading state
- `error` - Error messages

---

## 🚀 Performance Optimizations

### Cloudflare CDN
- Static assets cached globally
- Images served from nearest edge location
- Automatic brotli/gzip compression

### R2 Storage
- Direct object storage access
- No egress fees
- Custom domain support

### Workers
- Run at the edge (near users)
- Sub-millisecond cold starts
- Automatic scaling

### D1 Database
- SQLite at the edge
- Low latency queries
- Automatic replication

---

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Password hashing (bcrypt)
- Token expiration (24 hours)

### CORS
- Configurable allowed origins
- Preflight request handling
- Secure headers

### Input Validation
- File type checking (images only)
- File size limits (10MB)
- SQL injection prevention (prepared statements)
- XSS protection (React auto-escaping)

### Environment Separation
- Development vs Production configs
- Separate preview buckets
- Environment-specific secrets

---

## 📊 API Endpoints

### Public Endpoints
```
GET  /api/images              - Get published images
     ?status=published        - Filter by status
     ?category=Kitchen        - Filter by category
```

### Protected Endpoints (Require JWT)
```
POST   /api/auth/login       - Admin login
POST   /api/upload           - Upload new image
PUT    /api/images/:id       - Update image metadata
DELETE /api/images/:id       - Delete image
```

### Request/Response Examples

**Login:**
```bash
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "admin-001",
    "username": "admin",
    "email": "admin@theurbann.com"
  }
}
```

**Upload:**
```bash
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [binary]
metadata: {
  "customerName": "John Doe",
  "phone": "+1234567890",
  "category": "Kitchen",
  "tags": ["modern", "minimalist"],
  "status": "published"
}

Response:
{
  "success": true,
  "image": {
    "id": "uuid",
    "imageUrl": "https://...",
    ...
  }
}
```

**Get Images:**
```bash
GET /api/images?status=published&category=Kitchen

Response:
{
  "images": [
    {
      "id": "...",
      "imageUrl": "...",
      "customerName": "...",
      "category": "Kitchen",
      "tags": ["modern"],
      "uploadedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## 🧪 Testing Strategy

### Local Development
1. Frontend: `npm start` (localhost:3000)
2. Mock API responses for testing
3. Fallback to demo data if API fails

### Staging (Preview)
1. Deploy to preview branch
2. Use separate R2 bucket
3. Separate D1 database
4. Test full integration

### Production
1. Deploy to main branch
2. Monitor logs via Wrangler
3. Check Analytics dashboard
4. Set up alerts for errors

---

## 📈 Scaling Considerations

### Current Limits (Free Tier)
- **Pages**: Unlimited requests
- **Workers**: 100,000 requests/day
- **D1**: 5GB storage, 5M rows read/day
- **R2**: 10GB storage, 1M Class A ops/month

### If You Need More
- Upgrade to Workers Paid ($5/month)
  - 10M requests/month included
  - $0.50 per additional million
- R2 scales automatically
  - $0.015/GB/month storage
  - No egress fees
- D1 scales with usage
  - Currently in beta (free)

---

## 🔄 Future Enhancements

### Phase 2
- [ ] Image optimization (resize, compress)
- [ ] Bulk upload support
- [ ] Advanced search and filters
- [ ] Image editing (crop, rotate)

### Phase 3
- [ ] Multi-admin support with roles
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Customer portal

### Phase 4
- [ ] AI-powered image tagging
- [ ] Automatic watermarking
- [ ] Social media integration
- [ ] Mobile app

---

## 📞 Support & Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/
- **React Docs**: https://react.dev/
- **Vite Docs**: https://vitejs.dev/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/

---

This architecture provides a scalable, cost-effective, and performant solution for The Urbann's needs!
