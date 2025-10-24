# DNS Configuration Guide for fordipstech.com

## IONOS DNS Settings Configuration

### Step 1: Log into IONOS
- Go to: https://my.ionos.com/domains
- Login with your email: brineketum@gmail.com

### Step 2: Select Your Domain
- Click on **fordipstech.com**
- Go to **DNS Settings** or **DNS Management**

---

## DNS Records to Add

### For Main Website (fordipstech.com)

Add these **A Records**:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |

Add this **CNAME Record** for www:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | www | fordipstech.com | 3600 |

---

## For Admin Subdomain (admin.fordipstech.com)

Add this **CNAME Record**:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | admin | keysight-tech.github.io | 3600 |

---

## Step 3: Verify Configuration

After adding the DNS records:

1. **Wait 10-30 minutes** for DNS propagation
2. **Test your main site**: https://fordipstech.com
3. **Test admin panel**: https://admin.fordipstech.com/admin.html

---

## Step 4: Enable HTTPS in GitHub Pages

1. Go to your GitHub repository: https://github.com/Keysight-Tech/fordips-tech
2. Click **Settings** → **Pages**
3. Under "Custom domain", enter: **fordipstech.com**
4. Wait for DNS check to complete (green checkmark)
5. Check **"Enforce HTTPS"**

---

## Troubleshooting

### If domain doesn't work after 1 hour:
1. Check DNS propagation: https://dnschecker.org
2. Verify CNAME file exists in repository
3. Ensure GitHub Pages is enabled on the `dev` branch
4. Clear browser cache and try again

### If admin subdomain doesn't work:
1. Verify the CNAME record for `admin` is correct
2. Try accessing: https://admin.fordipstech.com/admin.html
3. Check that the admin.html file exists in the repository

---

## Quick Reference URLs

- **Main Site**: https://fordipstech.com
- **Admin Panel**: https://admin.fordipstech.com/admin.html
- **GitHub Pages**: https://keysight-tech.github.io/fordips-tech/
- **IONOS Dashboard**: https://my.ionos.com/domains

---

## Security Notes

✅ HTTPS will be automatically enabled by GitHub Pages
✅ DNS records are public information
✅ Admin panel should have authentication enabled
⚠️ Never share your IONOS password publicly

---

**Setup completed by Claude Code on October 24, 2024**
