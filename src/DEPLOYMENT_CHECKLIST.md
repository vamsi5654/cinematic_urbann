# ✅ Deployment Checklist

Use this checklist to ensure everything is configured correctly before and after deployment.

---

## 📋 Pre-Deployment

### Local Setup
- [ ] Node.js 18+ installed
- [ ] Ran `npm install` successfully
- [ ] App runs locally with `npm start`
- [ ] No build errors with `npm run build`

### Cloudflare Account
- [ ] Created Cloudflare account
- [ ] Logged in via Wrangler: `npx wrangler login`
- [ ] Account ID noted (found in dashboard URL)

### Database (D1)
- [ ] Created D1 database: `npx wrangler d1 create urbann_db`
- [ ] Copied `database_id` to `wrangler.toml`
- [ ] Ran migration: `npm run db:migrate`
- [ ] Verified tables created (check Cloudflare Dashboard)

### Storage (R2)
- [ ] Created R2 bucket named `urbann-images`
- [ ] Enabled public access on bucket
- [ ] Got public URL or set up custom domain
- [ ] Updated image URL in `/functions/api/[[path]].ts` (line ~160)
- [ ] Bucket binding name is `IMAGES_BUCKET` in `wrangler.toml`

### Code Updates
- [ ] Updated R2 public URL in Worker code
- [ ] Reviewed and customized `wrangler.toml`
- [ ] Set appropriate `ALLOWED_ORIGINS` in `wrangler.toml`
- [ ] Committed all changes to Git

---

## 🚀 Deployment

### Via Wrangler CLI
- [ ] Ran `npm run build` (no errors)
- [ ] Ran `npx wrangler pages deploy dist`
- [ ] Deployment successful
- [ ] Got deployment URL

### Via Git (Recommended)
- [ ] Pushed code to GitHub/GitLab
- [ ] Connected repository to Cloudflare Pages
- [ ] Configured build settings:
  - Build command: `npm run build`
  - Build output: `dist`
  - Root directory: `/`
  - Node version: `18`
- [ ] Initial deployment completed
- [ ] Got Pages URL (e.g., `your-project.pages.dev`)

---

## 🔌 Post-Deployment Setup

### Bind Resources (Critical!)
In Cloudflare Dashboard → Workers & Pages → Your Project → Settings → Functions:

#### D1 Database Binding
- [ ] Added D1 binding
- [ ] Variable name: `DB`
- [ ] Selected database: `urbann_db`
- [ ] Saved

#### R2 Bucket Binding
- [ ] Added R2 binding
- [ ] Variable name: `IMAGES_BUCKET`
- [ ] Selected bucket: `urbann-images`
- [ ] Saved

### Environment Variables
In Settings → Environment Variables:
- [ ] Set `JWT_SECRET` (generate with `openssl rand -base64 32`)
- [ ] Set `ALLOWED_ORIGINS` (your production domain)
- [ ] Saved and redeployed

---

## 🧪 Testing

### Basic Functionality
- [ ] Site loads at deployment URL
- [ ] Homepage displays correctly
- [ ] Gallery page loads
- [ ] Navigation works
- [ ] Responsive design works on mobile

### Admin Panel
- [ ] Can access `/admin` route
- [ ] Login page displays
- [ ] Can login with `admin` / `admin123`
- [ ] Dashboard loads after login
- [ ] Stats display (may show 0 initially)

### Image Upload
- [ ] Click "Upload Image" button
- [ ] Modal opens
- [ ] Can select/drag file
- [ ] Can fill in customer info
- [ ] Can add tags
- [ ] Upload succeeds (check for success message)
- [ ] Image appears in admin dashboard
- [ ] Image appears in gallery (if status = published)

### Gallery
- [ ] Gallery shows uploaded images
- [ ] Category filters work
- [ ] Only published images shown (not drafts)
- [ ] Images load from R2
- [ ] Clicking image navigates to detail page

### API Endpoints
- [ ] `GET /api/images` returns data
- [ ] `POST /api/auth/login` works
- [ ] `POST /api/upload` works (with auth)
- [ ] `DELETE /api/images/:id` works (with auth)

---

## 🔒 Security

### Change Default Credentials
- [ ] Changed admin password from `admin123`
- [ ] Generated bcrypt hash for new password
- [ ] Updated in D1 database:
  ```bash
  npx wrangler d1 execute urbann_db --command="UPDATE admin_users SET password_hash='new-hash' WHERE username='admin'"
  ```

### JWT Secret
- [ ] Generated strong JWT secret
- [ ] Added to Cloudflare Pages environment variables
- [ ] Not committed to Git

### CORS
- [ ] Set correct `ALLOWED_ORIGINS` in production
- [ ] Not using wildcard `*` in production

---

## 🌐 Domain Setup (Optional)

### Custom Domain
- [ ] Added custom domain in Pages settings
- [ ] Updated DNS records as instructed
- [ ] SSL certificate provisioned
- [ ] Site accessible at custom domain

### R2 Custom Domain (Optional)
- [ ] Set up custom domain for R2 (e.g., `images.yourdomain.com`)
- [ ] Updated image URL in Worker code
- [ ] Redeployed

---

## 📊 Monitoring

### Analytics
- [ ] Enabled Cloudflare Web Analytics
- [ ] Can view traffic in dashboard
- [ ] Checking for errors in Analytics

### Logs
- [ ] Know how to view logs: `npx wrangler pages deployment tail`
- [ ] Checked logs for any errors
- [ ] No critical errors present

---

## 🎨 Content

### Initial Content
- [ ] Uploaded at least 3-5 sample images
- [ ] Published at least 3 images
- [ ] Gallery looks populated
- [ ] Different categories represented

### Pages
- [ ] About page content updated
- [ ] Services page content updated
- [ ] Contact page email/phone updated
- [ ] Footer links updated

---

## 🚀 Launch

### Pre-Launch
- [ ] All tests passing
- [ ] No console errors
- [ ] Mobile responsive verified
- [ ] SEO basics in place (title, description)
- [ ] Favicon added
- [ ] 404 page works

### Launch Day
- [ ] Announced on social media
- [ ] Updated business cards/materials
- [ ] Monitoring for issues
- [ ] Ready to handle user feedback

### Post-Launch
- [ ] Regular backups scheduled
- [ ] Analytics tracking set up
- [ ] Performance monitoring
- [ ] User feedback collected

---

## 🆘 Emergency Rollback

If something goes wrong:

### Quick Fixes
- [ ] Check Cloudflare Dashboard for errors
- [ ] View deployment logs
- [ ] Verify bindings are correct
- [ ] Check environment variables

### Rollback Steps
1. Go to Cloudflare Pages → Deployments
2. Find last working deployment
3. Click "Retry" or "Rollback"
4. Fix issue in code
5. Redeploy

---

## 📈 Performance

### Initial Metrics
- [ ] Page load time < 3 seconds
- [ ] Images loading quickly
- [ ] No layout shift
- [ ] Smooth animations

### Optimizations (Future)
- [ ] Image optimization enabled
- [ ] Caching headers configured
- [ ] CDN working properly
- [ ] Lighthouse score > 90

---

## 📝 Documentation

### Team Handoff
- [ ] All documentation files reviewed
- [ ] Admin credentials shared securely
- [ ] Cloudflare account access granted
- [ ] GitHub/Git access granted

---

## ✅ Final Verification

```
□ Site is live and accessible
□ Admin can upload images
□ Images appear in gallery
□ All pages load correctly
□ Mobile experience is good
□ No console errors
□ Admin password changed
□ Analytics tracking
□ Backup strategy in place
□ Ready for production traffic
```

---

## 🎉 Congratulations!

When all items are checked, your site is ready for production!

**Site URL**: _______________________________

**Admin URL**: _______________________________

**Deployed on**: _______________________________

**Notes**: 
_________________________________________________
_________________________________________________
_________________________________________________

---

## 📞 Quick Reference

### Useful Commands
```bash
# View logs
npx wrangler pages deployment tail

# Run migration
npm run db:migrate

# Deploy
npm run deploy

# Build locally
npm run build
```

### Important URLs
- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **R2 Buckets**: Dashboard → R2
- **D1 Databases**: Dashboard → D1
- **Pages Deployments**: Dashboard → Workers & Pages

### Support Links
- [Cloudflare Docs](https://developers.cloudflare.com/)
- [Status Page](https://www.cloudflarestatus.com/)
- [Community](https://community.cloudflare.com/)

---

**Remember**: Save this checklist for future deployments or updates!
