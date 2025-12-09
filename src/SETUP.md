# 🚀 Local Development Setup Guide

Follow these steps to run The Urbann website locally in VSCode.

## Prerequisites

Make sure you have installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **VSCode** - [Download here](https://code.visualstudio.com/)

## Step-by-Step Setup

### 1. Open Project in VSCode

```bash
# Navigate to your project folder
cd path/to/the-urbann

# Open in VSCode
code .
```

### 2. Install Dependencies

Open the integrated terminal in VSCode (`Ctrl + `` or `Cmd + `` ) and run:

```bash
npm install
```

This will install all required packages (React, Vite, React Router, Framer Motion, etc.)

### 3. Start Development Server

```bash
npm start
```

The website will automatically open at `http://localhost:3000` 🎉

## 📝 Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start development server (auto-opens browser) |
| `npm run build` | Build for production (creates `dist` folder) |
| `npm run preview` | Preview production build locally |

## 🔧 Troubleshooting

### Port Already in Use

If port 3000 is already in use, Vite will automatically try the next available port (3001, 3002, etc.)

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

The project uses TypeScript. If you see type errors but the app runs fine, you can:
1. Install VSCode TypeScript extension
2. Restart VSCode
3. Run `npm install` again

### CSS Modules Not Working

Make sure your CSS files follow the naming pattern: `ComponentName.module.css`

## 📁 Project Structure

```
the-urbann/
├── src/
│   ├── App.tsx              ← Main app component
│   └── main.tsx             ← Entry point
├── pages/                   ← All page components
│   ├── Home.tsx
│   ├── Gallery.tsx
│   ├── ProjectDetail.tsx
│   ├── Services.tsx
│   ├── About.tsx
│   ├── Contact.tsx
│   └── Admin.tsx
├── components/              ← Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Topbar.tsx
│   └── Button.tsx
├── styles/
│   ├── globals.css         ← Global styles
│   └── *.module.css        ← Component styles
├── public/                 ← Static assets (images, etc.)
├── index.html             ← HTML template
├── package.json           ← Dependencies
└── vite.config.js        ← Build configuration
```

## 🎨 Development Tips

### Hot Module Replacement (HMR)
Changes to your code will automatically refresh in the browser - no need to restart the server!

### CSS Modules
Import styles like this:
```tsx
import styles from './Component.module.css';

<div className={styles.container}>...</div>
```

### Adding New Pages
1. Create `NewPage.tsx` in `/pages`
2. Create `NewPage.module.css` in `/pages`
3. Add route in `/src/App.tsx`

### Using Icons
```tsx
import { IconName } from 'lucide-react';

<IconName size={24} />
```

## 🚀 Deploying to Cloudflare Pages

### Build the Project
```bash
npm run build
```

### Deploy to Cloudflare
1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Pages** → **Create a project**
3. Connect your Git repository or upload the `dist` folder
4. Build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: 18

## 📞 Need Help?

- Check the console in VSCode terminal for error messages
- Check the browser console (F12) for runtime errors
- Make sure all files are in the correct directories

Happy coding! 🎉
