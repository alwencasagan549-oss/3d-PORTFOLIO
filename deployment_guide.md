# InfinityFree Deployment Guide

Follow these steps to deploy your 3D Portfolio to your InfinityFree hosting account.

## Step 1: Build the Project Locally
Run the following command in your project terminal:
```bash
npm run build
```
This will create a `dist` folder in your project directory. This folder contains all the optimized files (HTML, JS, CSS, compressed 3D models, and music) ready for the web.

## Step 2: Access Your Hosting Account
1. Log in to your **InfinityFree Client Area**.
2. Go to your **Control Panel** (cPanel).
3. Find the **Online File Manager** or use an FTP client like **FileZilla**.

## Step 3: Upload Your Files
1. Navigate to the `htdocs` folder. This is where your public website files go.
2. If there is an existing `index.php` or `index.html` file, you can delete or rename it.
3. Upload the **entire contents** of your local `dist` folder (files and subfolders like `assets`, `draco`) directly into the `htdocs` directory.
   - **IMPORTANT**: Do not upload the `dist` folder itself, only the files *inside* it.

## Step 4: Verify Deployment
1. Visit your domain (e.g., `yourdomain.infinityfreeapp.com`).
2. The site should load with your new "Digital Awakening" loading screen.
3. Ensure the background music plays after your first click.
4. Test the Contact Form and Live Demo links.

---

### Troubleshooting
- **404 on Refresh**: I have already included a `.htaccess` file in your `public` folder which will be copied to `dist`. Make sure it is uploaded to the root of your `htdocs` folder.
- **3D Models Not Loading**: I have configured the `.htaccess` to handle `.wasm` files. Ensure the `draco` folder is uploaded inside the `dist` structure correctly.
- **SSL**: InfinityFree provides a free SSL certificate. Make sure it is issued/active in your control panel for the "Security Padlock" icon.
