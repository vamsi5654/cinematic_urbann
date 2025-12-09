# The Urbann - Interior Design Studio

Premium interior design studio website with **full-stack Cloudflare integration**, cinematic aesthetics, built with React and CSS Modules.

## ✨ Features

### 🎨 Frontend
- Cinematic hero section with moody photography
- Masonry gallery with category filtering
- Project detail pages with before/after sliders
- Services, About, and Contact pages
- Responsive design with smooth animations
- Film grain effects and refined typography

### 🔐 Admin Panel
- Secure login with JWT authentication
- Drag & drop image upload
- Customer information management
- Category and tag organization
- Draft/Published status control
- Real-time statistics dashboard

### ☁️ Backend (Cloudflare Full Stack)
- **Pages**: Frontend hosting with global CDN
- **Workers**: Serverless API endpoints
- **R2**: Image storage (like AWS S3)
- **D1**: SQL database for metadata

---

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Open `http://localhost:3000` to view the site.

### Admin Access

Navigate to `/admin` and login:
- **Username**: `admin`
- **Password**: `admin123` (⚠️ Change in production!)

---

## 📚 Documentation

### Getting Started
- **[QUICK_START.md](./QUICK_START.md)** - 3-step quick start guide
- **[SETUP.md](./SETUP.md)** - Detailed local development setup

### Deployment
- **[CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)** - Complete deployment guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What's been built

### Understanding the System
- **[HOW_IT_WORKS.md](./HOW_IT_WORKS.md)** - Visual guide to the system
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture details

---

## 📁 Project Structure

```
the-urbann/
├── src/
│   ├── App.tsx                    # Main app with routing
│   ├── main.tsx                   # Entry point
│   └── services/
│       └── api.ts                 # API client
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
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Topbar.tsx
│   └── Button.tsx
│
├── functions/                     # Cloudflare Workers API
│   └── api/
│       └── [[path]].ts           # API endpoints
│
├── database/
│   └── schema.sql                # D1 database schema
│
├── styles/
│   ├── globals.css               # Global styles
│   └── *.module.css              # Component styles
│
├── wrangler.toml                 # Cloudflare config
└── vite.config.js               # Vite build config
```

---

## 🎨 Design System

### Color Palette
- **Charcoal**: `#0F1113` - Deep background
- **Off-white**: `#F5F3F1` - Primary text
- **Warm Sand**: `#C9A67A` - Accent & highlights
- **Soft Gold**: `#B98F3A` - Interactive elements

### Typography
- **Headings**: Playfair Display (serif, elegant)
- **Body**: Inter (sans-serif, readable)

### Aesthetic
- Cinematic moody photography
- Spacious layouts with breathing room
- Film grain overlay effects
- Smooth Framer Motion animations

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **CSS Modules** - Scoped styling
- **Vite** - Build tool
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend (Cloudflare)
- **Pages** - Static hosting + CDN
- **Workers** - Serverless API
- **R2** - Object storage
- **D1** - SQL database

---

## 🔌 API Endpoints

### Public
```
GET  /api/images              - Fetch published images
     ?status=published
     ?category=Kitchen
```

### Protected (Requires JWT)
```
POST   /api/auth/login       - Admin login
POST   /api/upload           - Upload image
PUT    /api/images/:id       - Update image
DELETE /api/images/:id       - Delete image
```

---

## 📊 Database Schema

### Images Table
```sql
CREATE TABLE images (
  id TEXT PRIMARY KEY,
  public_id TEXT UNIQUE,
  image_url TEXT,
  customer_name TEXT,
  phone TEXT,
  category TEXT,
  tags TEXT,                  -- JSON array
  description TEXT,
  status TEXT,                -- 'draft' | 'published'
  uploaded_at TIMESTAMP
);
```

### Admin Users Table
```sql
CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  password_hash TEXT,
  email TEXT,
  created_at TIMESTAMP
);
```

---

## 🚀 Deployment

### Deploy to Cloudflare Pages

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Login to Cloudflare**
   ```bash
   npx wrangler login
   ```

3. **Create D1 database**
   ```bash
   npx wrangler d1 create urbann_db
   ```

4. **Run migration**
   ```bash
   npm run db:migrate
   ```

5. **Create R2 bucket**
   - Go to Cloudflare Dashboard
   - Create bucket: `urbann-images`
   - Enable public access

6. **Deploy**
   ```bash
   npm run deploy
   ```

**👉 Full deployment guide: [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)**

---

## 💰 Cost Estimate

### Free Tier (Cloudflare)
- **Pages**: Unlimited requests ✅
- **Workers**: 100,000 requests/day ✅
- **D1**: 5GB storage, 5M reads/day ✅
- **R2**: 10GB storage, 1M ops/month ✅

**Total: $0/month** for most use cases!

### Paid (if needed)
- **Workers Paid**: $5/month → 10M requests
- **R2**: $0.015/GB/month (cheaper than S3)

---

## 🔐 Security

- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ File type validation
- ✅ Token expiration

**⚠️ Important**: Change the default admin password immediately after first login!

---

## 🛠️ Available Commands

```bash
# Development
npm start              # Start dev server (localhost:3000)
npm run dev:api        # Start Workers API locally

# Database
npm run db:migrate     # Run database migration

# Build & Deploy
npm run build          # Build for production
npm run preview        # Preview production build
npm run deploy         # Deploy to Cloudflare Pages
```

---

## 🔄 How It Works

```
Admin uploads image → Cloudflare R2 (storage) + D1 (metadata)
                                    ↓
                    Gallery fetches from API
                                    ↓
                    Visitors see published images
```

**👉 Visual guide: [HOW_IT_WORKS.md](./HOW_IT_WORKS.md)**

---

## 📝 Features Checklist

- ✅ Cinematic homepage
- ✅ Project gallery with filtering
- ✅ Project detail pages
- ✅ Services, About, Contact pages
- ✅ Admin dashboard
- ✅ Image upload with metadata
- ✅ Draft/Published workflow
- ✅ Authentication system
- ✅ Cloudflare R2 storage
- ✅ Cloudflare D1 database
- ✅ REST API with Workers
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Accessibility features

---

## 🎯 Next Steps After Deployment

1. **Change admin password**
2. **Upload your first images**
3. **Configure custom domain**
4. **Set up analytics**
5. **Add SEO meta tags**
6. **Enable form submissions**

---

## 🆘 Troubleshooting

### Can't login to admin?
- Check console for errors
- Verify API is running
- Clear browser cache

### Images not uploading?
- Check R2 bucket exists
- Verify R2 binding in Cloudflare
- Check file size (< 10MB)

### Gallery not loading?
- Check D1 migration ran
- Verify API endpoints work
- Check browser console

**👉 Full troubleshooting: [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md#-troubleshooting)**

---

## 📚 Learn More

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

## 📞 Support

For questions or issues:
1. Check the documentation files
2. Review error messages in console
3. Check Cloudflare dashboard logs

---

## 🎉 Ready to Launch?

1. Follow **[CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)** for deployment
2. Upload your beautiful interior design photos
3. Share your portfolio with the world!

**Built with ❤️ using React, TypeScript, and Cloudflare's edge platform**
