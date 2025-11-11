# Fix Auto-Deploy: Connect GitHub Integration

## Jawaban Singkat

**TIDAK perlu set webhook manual di kedua tempat!**

Ketika project di-import via **GitHub Integration** di Vercel, Vercel akan **otomatis**:
- ✅ Create webhook di GitHub
- ✅ Setup connection
- ✅ Enable auto-deploy

**Tapi** jika project dibuat via **Vercel CLI** dulu, perlu reconnect ke GitHub.

---

## Cara Fix Auto-Deploy

### Opsi 1: Reconnect Project ke GitHub (Recommended)

1. **Buka Vercel Dashboard**:
   - https://vercel.com/dashboard
   - Pilih project: `ultah_giva`

2. **Settings → Git**:
   - Cek apakah terlihat: "Connected to GitHub: `rizkybrama/ultah_giva`"
   
3. **Jika BELUM terhubung**:
   - Klik **"Connect Git Repository"**
   - Pilih **GitHub**
   - coba
   - Pilih repository: `rizkybrama/ultah_giva`
   - Klik **"Connect"**
   - Vercel akan otomatis create webhook di GitHub

4. **Verify**:
   - Di Vercel: Settings → Git → harus terlihat "Connected to GitHub"
   - Di GitHub: Settings → Webhooks → harus ada webhook dari Vercel

---

### Opsi 2: Delete & Re-import Project (Jika reconnect tidak work)

1. **Delete project di Vercel**:
   - Vercel Dashboard → Project Settings → Delete Project
   - Confirm delete

2. **Import ulang via GitHub**:
   - https://vercel.com/new
   - test lg
   - Klik **"Import Git Repository"**
   - Pilih **GitHub**
   - Pilih repository: `rizkybrama/ultah_giva`
   - Klik **"Import"**

3. **Configure**:
   - Framework: Next.js (auto-detected)
   - Install Command: `yarn` (atau `yarn install`)
   - Build Command: `yarn build`
   - Output Directory: `.next`

4. **Deploy**:
   - Klik **"Deploy"**
   - Setelah ini, setiap push ke `main` akan auto-deploy

---

## Verifikasi Webhook di GitHub

Setelah connect, cek di GitHub:

1. **Buka**: https://github.com/rizkybrama/ultah_giva/settings/hooks
2. **Harus ada webhook** dengan:
   - URL: `https://api.vercel.com/v1/integrations/deploy/...`
   - Events: `push`, `pull_request`
   - Status: Active (green)

**Jika tidak ada webhook** = GitHub Integration belum terhubung dengan benar.

---

## Verifikasi di Vercel

1. **Vercel Dashboard → Project Settings → Git**:
   - ✅ Connected to: `rizkybrama/ultah_giva`
   - ✅ Production Branch: `main`
   - ✅ Auto-deploy: Enabled

2. **Vercel Dashboard → Deployments**:
   - Source harus: "GitHub" (bukan "CLI")
   - Jika source = "CLI" = belum terhubung ke GitHub

---

## Test Auto-Deploy

Setelah reconnect, test dengan:

```bash
# Buat perubahan kecil
echo "<!-- Test -->" >> README.md

# Commit dan push
git add README.md
git commit -m "Test auto-deploy"
git push origin main
```

**Expected behavior**:
- ✅ Push ke GitHub
- ✅ Vercel detect push (1-2 menit)
- ✅ Auto trigger build
- ✅ Auto deploy

**Cek di Vercel Dashboard → Deployments**:
- Harus muncul deployment baru otomatis
- Source: "GitHub"
- Status: Building → Ready

---

## Troubleshooting

### Masalah: Webhook tidak ada di GitHub
**Solusi**: Reconnect project ke GitHub (Opsi 1 atau 2)

### Masalah: Webhook ada tapi tidak trigger
**Solusi**: 
1. Cek webhook di GitHub → Recent Deliveries
2. Lihat apakah ada error
3. Coba "Redeliver" webhook terakhir

### Masalah: Auto-deploy masih tidak work
**Solusi**:
1. Pastikan push ke branch `main` (bukan branch lain)
2. Pastikan GitHub Integration terhubung
3. Cek Vercel Dashboard → Settings → Git → Auto-deploy enabled

---

## Kesimpulan

**TIDAK perlu set webhook manual!**

Yang perlu dilakukan:
1. ✅ Pastikan project di-import via **GitHub Integration** (bukan CLI)
2. ✅ Vercel akan otomatis create webhook
3. ✅ Auto-deploy akan aktif

Jika project dibuat via CLI, perlu **reconnect** atau **re-import** via GitHub.

