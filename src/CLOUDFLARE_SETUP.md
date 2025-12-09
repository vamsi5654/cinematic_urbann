# 🚀 Cloudflare Full Stack Setup Guide

Complete guide to deploy The Urbann with Cloudflare Pages, Workers, D1, and R2.

---

## 📋 Prerequisites

1. **Cloudflare Account** - [Sign up for free](https://dash.cloudflare.com/sign-up)
2. **Node.js** (v18+) - [Download here](https://nodejs.org/)
3. **Wrangler CLI** - Will be installed with dependencies

---

## 🔧 Step 1: Install Dependencies

```bash
npm install
```

---

## 🗄️ Step 2: Create Cloudflare D1 Database

### 2.1 Login to Cloudflare via Wrangler

```bash
npx wrangler login
```

This will open your browser to authenticate.

### 2.2 Create the Database

```bash
npx wrangler d1 create urbann_db
```

**Output will look like:**
```
✅ Successfully created DB 'urbann_db'
binding = "DB"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2.3 Update wrangler.toml

Copy the `database_id` from the output and update `/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "urbann_db"
database_id = "your-actual-database-id-here"  # ← Paste your ID here
```

### 2.4 Run Database Migration

```bash
npm run db:migrate
```

This creates all tables (images, projects, admin_users, etc.)

---

## 🪣 Step 3: Create Cloudflare R2 Bucket (Image Storage)

### 3.1 Create R2 Bucket via Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** in the sidebar
3. Click **Create bucket**
4. Name it: `urbann-images`
5. Click **Create bucket**

### 3.2 Create Preview Bucket (Optional)

For development/preview environments:
- Create another bucket: `urbann-images-preview`

### 3.3 Enable Public Access (for image URLs)

**Option A: Custom Domain (Recommended)**
1. Go to your R2 bucket settings
2. Click **Settings** → **Public Access**
3. Add a custom domain (e.g., `images.your-domain.com`)
4. Follow the DNS setup instructions

**Option B: Public Bucket URL**
1. Go to bucket settings
2. Enable **Public Access**
3. Get the public URL (e.g., `https://pub-xxxxx.r2.dev`)

### 3.4 Update Worker Code

In `/functions/api/[[path]].ts`, update line ~160:

```typescript
// Replace this line:
const imageUrl = `https://images.your-domain.com/${fileName}`;

// With your actual R2 public URL:
const imageUrl = `https://pub-xxxxx.r2.dev/${fileName}`;
// OR your custom domain:
const imageUrl = `https://images.your-domain.com/${fileName}`;
```

---

## 🔐 Step 4: Configure Environment Variables

### 4.1 Create Local Environment File

```bash
cp .env.example .env.local
```

### 4.2 Update .env.local

```env
VITE_API_URL=/api
```

For local development with Workers, use:
```env
VITE_API_URL=http://localhost:8788/api
```

### 4.3 Set Production Secrets (via Cloudflare Dashboard)

1. Go to **Workers & Pages** → **Your Project** → **Settings** → **Variables**
2. Add these secrets:
   - `JWT_SECRET`: Generate a strong random key (e.g., use `openssl rand -base64 32`)
   - `ADMIN_PASSWORD_HASH`: Generate bcrypt hash of your password

---

## 🚀 Step 5: Deploy to Cloudflare Pages

### Method 1: Deploy via Wrangler (CLI)

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

Follow the prompts:
- **Project name**: `the-urbann` (or your choice)
- **Production branch**: `main`

### Method 2: Deploy via Git (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - **Workers & Pages** → **Create application** → **Pages**
   - **Connect to Git** → Select your repository
   - **Build settings**:
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
     - **Root directory**: `/`
     - **Node version**: `18`

3. **Add Environment Variables** (in Pages settings):
   - `VITE_API_URL`: `/api`
   - Any other variables from `.env.example`

4. **Deploy**: Click **Save and Deploy**

---

## 🔌 Step 6: Bind Resources to Pages

After deployment, you need to bind D1 and R2 to your Pages project:

### 6.1 Via Cloudflare Dashboard

1. Go to **Workers & Pages** → **Your Project** → **Settings** → **Functions**
2. **D1 Database Bindings**:
   - Variable name: `DB`
   - D1 database: Select `urbann_db`
3. **R2 Bucket Bindings**:
   - Variable name: `IMAGES_BUCKET`
   - R2 bucket: Select `urbann-images`
4. Click **Save**

### 6.2 Via wrangler.toml (for CLI deploys)

Your `wrangler.toml` should already have these configured:

```toml
[[d1_databases]]
binding = "DB"
database_name = "urbann_db"
database_id = "your-database-id"

[[r2_buckets]]
binding = "IMAGES_BUCKET"
bucket_name = "urbann-images"
```

---

## 🧪 Step 7: Test Your Deployment

### 7.1 Access Your Site

Your site will be at: `https://the-urbann.pages.dev` (or your custom domain)

### 7.2 Test Admin Panel

1. Navigate to `/admin`
2. Login with:
   - **Username**: `admin`
   - **Password**: `admin123` (⚠️ CHANGE THIS IN PRODUCTION!)
3. Try uploading an image
4. Check that it appears in the Gallery

### 7.3 Test Gallery

1. Navigate to `/gallery`
2. Verify uploaded images appear
3. Test category filtering
4. Click on an image to see details

---

## 🔒 Step 8: Secure Your Admin (IMPORTANT!)

### 8.1 Change Default Password

1. **Generate a new bcrypt hash**:
   ```bash
   # Using Node.js bcrypt
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your-new-password', 10, (err, hash) => console.log(hash));"
   ```

2. **Update database**:
   ```bash
   npx wrangler d1 execute urbann_db --command="UPDATE admin_users SET password_hash='your-new-hash' WHERE username='admin'"
   ```

### 8.2 Add Proper JWT Library

The current implementation uses basic JWT encoding. For production:

1. Install `jsonwebtoken`:
   ```bash
   npm install jsonwebtoken
   npm install --save-dev @types/jsonwebtoken
   ```

2. Update `/functions/api/[[path]].ts` to use proper JWT signing/verification

### 8.3 Enable HTTPS Only

In `wrangler.toml`, ensure:
```toml
[env.production]
ALLOWED_ORIGINS = "https://your-domain.com"
```

---

## 🎯 Step 9: Custom Domain (Optional)

### 9.1 Add Custom Domain

1. Go to **Workers & Pages** → **Your Project** → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `theurbann.com`)
4. Follow DNS instructions

### 9.2 Update CORS Settings

In `wrangler.toml`:
```toml
[env.production]
ALLOWED_ORIGINS = "https://theurbann.com"
```

---

## 🛠️ Development Workflow

### Local Development (Frontend Only)

```bash
npm start
```

Runs at `http://localhost:3000` with mock data fallback.

### Local Development (Full Stack)

Terminal 1 - Frontend:
```bash
npm start
```

Terminal 2 - Workers API:
```bash
npm run dev:api
```

Update `.env.local`:
```env
VITE_API_URL=http://localhost:8788/api
```

---

## 📊 Monitoring & Analytics

### View Logs

```bash
# Pages logs
npx wrangler pages deployment tail

# Workers logs
npx wrangler tail
```

### Analytics Dashboard

View in Cloudflare Dashboard:
- **Workers & Pages** → **Your Project** → **Analytics**
- See requests, errors, and performance metrics

---

## 🆘 Troubleshooting

### Issue: "Database not found"

**Solution**: Make sure you ran the migration:
```bash
npm run db:migrate
```

### Issue: "R2 bucket not found"

**Solution**: Check bindings in Cloudflare Dashboard under **Settings** → **Functions**

### Issue: "CORS errors"

**Solution**: Update `ALLOWED_ORIGINS` in production settings

### Issue: "Images not uploading"

**Solution**: 
1. Check R2 bucket permissions
2. Verify R2 binding is correct
3. Check Worker logs: `npx wrangler tail`

### Issue: "401 Unauthorized"

**Solution**: 
1. Clear browser cache/localStorage
2. Login again
3. Check JWT_SECRET is set in production

---

## 📝 Summary Checklist

- [ ] Node.js installed
- [ ] Cloudflare account created
- [ ] Wrangler authenticated (`wrangler login`)
- [ ] D1 database created and migrated
- [ ] R2 bucket created with public access
- [ ] Updated `wrangler.toml` with database_id
- [ ] Updated Worker code with R2 public URL
- [ ] Deployed to Cloudflare Pages
- [ ] Bound D1 and R2 to Pages project
- [ ] Changed default admin password
- [ ] Tested upload and gallery
- [ ] Custom domain configured (optional)

---

## 🎉 You're Done!

Your site is now live with:
- ✅ Frontend hosted on Cloudflare Pages
- ✅ Images stored in R2
- ✅ Metadata in D1 database
- ✅ API powered by Workers
- ✅ Admin panel with authentication

**Default Admin Access:**
- URL: `https://your-domain.com/admin`
- Username: `admin`
- Password: `admin123` (⚠️ CHANGE THIS!)

---

## 📚 Next Steps

1. **Add more features**: Edit functionality, bulk uploads, image optimization
2. **Analytics**: Track visitor behavior with Cloudflare Web Analytics
3. **SEO**: Add meta tags, sitemap, and structured data
4. **Performance**: Enable Cloudflare CDN caching
5. **Backup**: Regular D1 database backups

---

## 💡 Tips

- Cloudflare Pages has a generous free tier
- D1 is currently free during beta
- R2 storage: $0.015/GB/month (much cheaper than S3)
- Workers: 100,000 requests/day free

---

Need help? Check:
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [R2 Storage Docs](https://developers.cloudflare.com/r2/)
- [Workers Docs](https://developers.cloudflare.com/workers/)
