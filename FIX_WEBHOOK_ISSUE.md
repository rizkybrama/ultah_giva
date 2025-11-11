# Fix: Webhook Tidak Terbuat Setelah Re-import

## Masalah
Setelah re-import project, webhook tidak terbuat otomatis di GitHub.

## Solusi

### 1. Cek GitHub Integration di Vercel

1. **Buka Vercel Dashboard**:
   - https://vercel.com/dashboard
   - Klik profile picture (top right) → **Settings**

2. **Settings → Integrations → GitHub**:
   - Pastikan GitHub terhubung
   - Jika belum, klik **"Connect GitHub"**
   - Authorize Vercel untuk akses repository

3. **Pastikan permissions**:
   - Vercel perlu akses ke repository `rizkybrama/ultah_giva`
   - Jika repository private, pastikan Vercel punya akses

### 2. Re-authorize GitHub Integration

1. **Vercel Dashboard → Settings → Integrations → GitHub**
2. Klik **"Configure"** atau **"Re-authorize"**
3. Pastikan permissions:
   - ✅ Repository access (atau All repositories)
   - ✅ Repository webhooks
   - ✅ Repository contents

4. **Save** atau **Authorize**

### 3. Re-import Project Setelah Re-authorize

1. **Delete project** (jika perlu):
   - Project Settings → Delete Project

2. **Import ulang**:
   - https://vercel.com/new
   - Import Git Repository
   - Pilih `rizkybrama/ultah_giva`
   - Pastikan GitHub account yang benar terpilih
   - Import & Deploy

3. **Setelah import, cek webhook**:
   - https://github.com/rizkybrama/ultah_giva/settings/hooks
   - Harus ada webhook dari Vercel

### 4. Manual Create Webhook (Jika Masih Tidak Terbuat)

Jika setelah re-authorize masih tidak terbuat, bisa create manual:

1. **Di Vercel Dashboard → Project Settings → Git**:
   - Copy "Webhook URL" atau "Deploy Hook URL" (jika ada)

2. **Atau di GitHub**:
   - https://github.com/rizkybrama/ultah_giva/settings/hooks
   - Klik **"Add webhook"**
   - Payload URL: `https://api.vercel.com/v1/integrations/deploy/...`
     (URL ini bisa didapat dari Vercel Dashboard → Project Settings → Git)
   - Content type: `application/json`
   - Secret: (kosongkan atau dapatkan dari Vercel)
   - Events: Pilih **"Just the push event"** atau **"Let me select individual events"**
     - Centang: ✅ `push`
     - Centang: ✅ `pull_request`
   - Active: ✅
   - Klik **"Add webhook"**

**Tapi ini seharusnya tidak perlu** - Vercel harus otomatis create webhook.

### 5. Cek Repository Access

1. **GitHub → Settings → Applications → Authorized OAuth Apps**:
   - https://github.com/settings/applications
   - Cari **"Vercel"**
   - Klik **"Configure"**
   - Pastikan repository `ultah_giva` ada di list
   - Jika tidak, tambahkan atau pilih "All repositories"

### 6. Cek Repository Settings

1. **GitHub Repository → Settings → Webhooks**:
   - https://github.com/rizkybrama/ultah_giva/settings/hooks
   - Pastikan tidak ada limit atau restriction

2. **GitHub Repository → Settings → Actions → General**:
   - Pastikan "Allow all actions and reusable workflows" enabled
   - (Ini untuk GitHub Actions, tapi bisa affect webhooks juga)

---

## Troubleshooting Steps

### Step 1: Verify Vercel-GitHub Connection
- Vercel Dashboard → Settings → Integrations → GitHub
- Pastikan terhubung dan authorized

### Step 2: Check Repository Access
- GitHub → Settings → Applications → Vercel
- Pastikan repository `ultah_giva` accessible

### Step 3: Re-import dengan Fresh Connection
- Disconnect GitHub integration
- Reconnect dengan full permissions
- Re-import project

### Step 4: Check Vercel Project Settings
- Project Settings → Git
- Pastikan "Connected to GitHub" terlihat
- Jika tidak, klik "Connect Git Repository"

---

## Alternative: Use Deploy Hooks

Jika webhook masih tidak work, bisa pakai Deploy Hooks:

1. **Vercel Dashboard → Project Settings → Deploy Hooks**
2. **Create Hook**:
   - Name: `GitHub Push`
   - Branch: `main`
   - Klik **"Create Hook"**
3. **Copy Hook URL**
4. **Di GitHub → Settings → Webhooks → Add webhook**:
   - Payload URL: [paste hook URL]
   - Content type: `application/json`
   - Events: `push`
   - Add webhook

Tapi ini workaround - seharusnya GitHub Integration otomatis handle ini.

---

## Contact Vercel Support

Jika semua langkah di atas tidak work:
- Vercel Support: https://vercel.com/support
- Atau email: support@vercel.com
- Jelaskan: "Webhook tidak terbuat otomatis setelah import GitHub repository"

---

## Quick Checklist

- [ ] GitHub Integration terhubung di Vercel Settings
- [ ] Repository accessible di GitHub OAuth Apps
- [ ] Re-authorize GitHub Integration dengan full permissions
- [ ] Re-import project setelah re-authorize
- [ ] Cek webhook di GitHub → Settings → Webhooks
- [ ] Test dengan push ke main branch

