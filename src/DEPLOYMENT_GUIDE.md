# 🚀 VoterPrime Demo Deployment Guide

## Overview
This guide will help you deploy your VoterPrime mobile demo to GitHub Pages so your team can test it on their smartphones.

---

## 📋 **STEP 1: Prepare Your Project Files**

1. **Download all files** from Figma Make
2. **Create a new folder** on your computer called `voterprime-demo`
3. **Copy all files** maintaining the exact structure shown in this project
4. **Ensure you have all required files:**
   - `App.tsx` (main app file)
   - `components/` folder with all component files
   - `styles/globals.css` (styling)
   - `package.json` (build configuration)
   - All other project files

---

## 📁 **STEP 2: Create GitHub Repository**

1. Go to [github.com](https://github.com) and sign in
2. Click the green **"New"** button (or the "+" icon → "New repository")
3. **Repository Settings:**
   - **Name:** `voterprime-demo`
   - **Description:** `VoterPrime Mobile Demo - Civic Engagement App`
   - **Visibility:** ✅ **Public** (required for GitHub Pages)
   - ✅ Check "Add a README file"
4. Click **"Create repository"**

---

## 📤 **STEP 3: Upload Your Files**

### Option A: Web Upload (Recommended - Easy)
1. In your new repository, click **"uploading an existing file"**
2. **Drag and drop** your entire `voterprime-demo` folder onto the upload area
3. Write commit message: `Initial VoterPrime demo upload`
4. Click **"Commit changes"**

### Option B: Git Commands (Advanced)
```bash
git clone https://github.com/[YOUR-USERNAME]/voterprime-demo.git
cd voterprime-demo
# Copy all your files here
git add .
git commit -m "Initial VoterPrime demo upload"
git push origin main
```

---

## ⚙️ **STEP 4: Enable GitHub Pages**

1. In your repository, go to **Settings** tab (top navigation)
2. Scroll down to **"Pages"** in the left sidebar
3. **Configure Pages:**
   - **Source:** Select **"Deploy from a branch"**
   - **Branch:** Select **"main"** (or "master")
   - **Folder:** Select **"/ (root)"**
4. Click **"Save"**

---

## 🔧 **STEP 5: Wait for Deployment**

1. Go to **Actions** tab in your repository
2. Watch the build process (takes 2-5 minutes)
3. Once complete with green checkmark ✅, your site will be live at:
   ```
   https://[YOUR-USERNAME].github.io/voterprime-demo
   ```

---

## 📱 **STEP 6: Generate QR Code for Mobile Testing**

### Method 1: Online QR Generator
1. Go to [qr-code-generator.com](https://www.qr-code-generator.com)
2. Enter your GitHub Pages URL: `https://[YOUR-USERNAME].github.io/voterprime-demo`
3. **Customize (Optional):**
   - Add VoterPrime logo in center
   - Change colors to black/white theme
   - Add text "VoterPrime Demo"
4. **Download** as PNG or SVG
5. **Test** by scanning with your phone

### Method 2: Quick QR Code
1. Go to [qr.io](https://qr.io) or [qrcode-monkey.com](https://www.qrcode-monkey.com)
2. Paste your URL
3. Generate and download

---

## 📧 **STEP 7: Create Team Sharing Message**

Copy and customize this message for your team:

```
🎉 VoterPrime Mobile Demo is LIVE!

📱 TEST ON YOUR PHONE:
🔗 https://[YOUR-USERNAME].github.io/voterprime-demo
📱 Or scan the QR code below

🎯 WHAT TO TEST:
✅ Complete priority input flow (drag to reorder)
✅ Policy mapping corrections (orange buttons are clickable!)
✅ Navigate through all recommendation categories
✅ Test heart/save functionality
✅ Try persistent bottom navigation (now with consistent bold styling)
✅ Check responsive design on your device

💡 TESTING SCENARIOS:

📋 **Scenario 1: New User Flow**
1. Start at landing page → Click "Get Started"
2. Autofill demo data → Try drag-and-drop reordering
3. Submit → Go through policy mapping corrections
4. Explore each recommendation category

📋 **Scenario 2: Navigation Testing**
1. Complete initial flow to reach recommendations
2. Test bottom navigation between all 4 sections
3. Try editing concerns from other screens
4. Test back buttons throughout app

📋 **Scenario 3: Save/Heart Functionality**
1. Navigate to any recommendation detail page
2. Click heart to save items
3. Go to Save/Share screen to see saved items
4. Test removing saved items

💌 **FEEDBACK:** Send thoughts to [YOUR-EMAIL]
📅 **Deadline:** [YOUR-DEADLINE]
```

---

## 🔍 **STEP 8: Testing Checklist**

### Before Sharing:
- [ ] App loads successfully at GitHub Pages URL
- [ ] All orange-highlighted buttons work in policy mapping
- [ ] Bottom navigation uses consistent bold styling
- [ ] Drag-and-drop works for priority reordering
- [ ] Heart/save functionality works
- [ ] Responsive design looks good on mobile
- [ ] QR code scans correctly to the URL

### Team Testing Focus:
- [ ] Touch interactions feel natural
- [ ] Navigation is intuitive
- [ ] App performance is smooth
- [ ] Content scrolls properly under fixed header
- [ ] All demo flows work end-to-end

---

## 🚨 **TROUBLESHOOTING**

### **If Deployment Fails:**
1. Check **Actions** tab for error messages
2. Ensure `package.json` is in root directory
3. Verify repository is **Public**
4. Try re-uploading files

### **If App Doesn't Load:**
1. Wait 10-15 minutes for DNS propagation
2. Try incognito/private browsing mode
3. Check browser console for errors (F12)
4. Verify URL matches your GitHub username

### **If Mobile Experience is Poor:**
1. Test on actual devices, not just browser dev tools
2. Check that all images load properly
3. Verify touch targets are appropriate size
4. Test in both portrait and landscape modes

### **Common Issues:**
- **"404 Page Not Found"** → Check Pages settings, ensure branch is correct
- **"App Won't Start"** → Verify all files uploaded, check package.json
- **"Slow Loading"** → Check image sizes, test on different networks
- **"Touch Not Working"** → Test on iOS Safari and Android Chrome

---

## ✨ **PROFESSIONAL TOUCHES**

### Add to Repository README:
Create a nice README.md in your repository:

```markdown
# VoterPrime Demo

A mobile-first civic engagement application that helps users turn concerns into action.

## 🚀 Live Demo
**Mobile Optimized:** https://[YOUR-USERNAME].github.io/voterprime-demo

## 📱 Best Experience
Scan QR code or visit link above on your mobile device for optimal experience.

## 🎯 Key Features
- Priority input with intuitive drag-and-drop reordering
- AI-powered policy mapping with correction flow
- Comprehensive civic action recommendations
- Persistent bottom navigation with consistent styling
- Heart/save functionality for bookmarking actions

## 🧪 Demo Data
App includes realistic demo data for testing all user flows.
```

### Custom Domain (Optional):
If you want a cleaner URL:
1. Go to repository Settings → Pages
2. Add custom domain like `voterprime-demo.your-domain.com`
3. Update DNS settings with your domain provider

---

## 🎉 **YOU'RE READY TO SHARE!**

Your VoterPrime demo is now:
- ✅ Live on GitHub Pages
- ✅ Mobile-optimized
- ✅ QR code ready
- ✅ Team sharing message prepared
- ✅ Navigation buttons consistent with bold styling
- ✅ Orange-highlighted clickable buttons working

**🚀 Share the QR code and URL with your team for mobile testing!**

---

## 📞 **Need Help?**

If you run into issues:
1. Check the troubleshooting section above
2. Visit [GitHub Pages Documentation](https://pages.github.com/)
3. Ask in your team Slack/Discord for technical support

**Happy testing! 🎊**