This repository is configured for GitHub Pages hosting at:

**https://braceyourself.evergreenmediadesign.com**

The project is deployed directly from the repository root and uses a `CNAME` file to bind the custom subdomain.

---

## 📁 Repository Structure

| File / Folder | Purpose |
|---------------|---------|
| `CNAME` | Declares the custom domain: `braceyourself.evergreenmediadesign.com` |
| `index.html` | Main landing page served by GitHub Pages |
| `README.md` | Documentation for deployment and configuration |

---

## 🚀 Deployment Instructions

1. Create the GitHub repository: **GeneralMillz/braceyourself**
2. Copy all project files into the repository root
3. Commit and push to the `main` branch
4. In GitHub:
   - Go to **Settings → Pages**
   - Set **Source: Deploy from branch**
   - Select **Branch: main**
5. Add the custom domain:
   ```
   braceyourself.evergreenmediadesign.com
   ```
6. GitHub will automatically:
   - Detect the `CNAME` file  
   - Validate DNS  
   - Issue an SSL certificate  

Once DNS propagates, the site will be live.

---

## 🌐 DNS Configuration (Squarespace Domains)

Add the following DNS record:

| Host | Type | Value | TTL |
|------|------|--------|-----|
| `braceyourself` | CNAME | `generalmillz.github.io` | Auto |

This points the subdomain to GitHub Pages.

---

## ✅ Status Checklist

- ✔ Custom subdomain configured  
- ✔ DNS record added  
- ✔ `CNAME` file included  
- ✔ GitHub Pages enabled  
- ⏳ DNS propagation (may take 5–30 minutes)  

---

## 🛠 Support

For deployment issues, refer to:

- GitHub Pages documentation  
- Evergreen Media Design internal deployment notes  

