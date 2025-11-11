# Cara Deploy ke Vercel

## Metode 1: Menggunakan Vercel CLI

### Kapan menggunakan:
- ✅ **Quick testing** atau prototype
- ✅ **One-off deployment** (deploy sekali, jarang update)
- ✅ **Personal project** yang tidak perlu auto-deploy
- ✅ **Development/staging** environment

### Kelebihan:
- ⚡ Cepat dan langsung
- 🎯 Full control manual
- 🔧 Cocok untuk testing

### Kekurangan:
- ❌ Harus manual run command setiap deploy
- ❌ Tidak ada automatic deployment
- ❌ Tidak ada preview deployments untuk PR
- ❌ Lebih sulit untuk collaboration

### Langkah-langkah:

1. **Install Vercel CLI** (jika belum terinstall):
   ```bash
   npm install -g vercel
   ```

2. **Login ke Vercel**:
   ```bash
   vercel login
   ```
   - Akan membuka browser untuk login
   - Atau bisa login via email

3. **Deploy dari project directory**:
   ```bash
   cd "/Users/rizkysakti/iCloud/Documents/project/project/Percobann apk/ultah"
   vercel
   ```

4. **Follow prompts**:
   - Set up and deploy? **Yes**
   - Which scope? Pilih akun Anda
   - Link to existing project? **No** (untuk pertama kali)
   - Project name? (biarkan default atau beri nama)
   - Directory? **./** (current directory)
   - Override settings? **No**

5. **Production deploy**:
   ```bash
   vercel --prod
   ```

### Update deployment:
```bash
vercel --prod
```

**Note**: Opsi 1 juga bisa untuk production, tapi kurang praktis untuk long-term maintenance.

---

## Metode 2: Via GitHub Integration (Recommended untuk Production)

### Kapan menggunakan:
- ✅ **Production apps** yang akan sering di-update
- ✅ **Team collaboration** (multiple developers)
- ✅ **Long-term projects**
- ✅ **Butuh automatic deployment**

### Kelebihan:
- 🚀 **Automatic deployment** setiap push ke GitHub
- 🔄 **Preview deployments** untuk setiap Pull Request
- 👥 **Better collaboration** - semua tim bisa lihat changes
- 📊 **History tracking** - semua deployment tercatat di dashboard
- ⏪ **Easy rollback** - bisa rollback ke deployment sebelumnya
- 🔍 **Better monitoring** - build logs, analytics, dll
- 🎯 **CI/CD workflow** - professional development workflow

### Kekurangan:
- ⏱️ Perlu setup awal (push ke GitHub dulu)
- 🔗 Harus punya GitHub repository

### Kenapa disarankan untuk production?
1. **Automatic deployment** = setiap push langsung deploy, tidak perlu manual
2. **Preview deployments** = test changes di PR sebelum merge ke production
3. **History & rollback** = mudah track dan rollback jika ada bug
4. **Team collaboration** = semua developer bisa deploy tanpa akses CLI
5. **Professional workflow** = standard practice untuk production apps

### Langkah-langkah:

1. **Push code ke GitHub**:
   ```bash
   git init  # jika belum ada git
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import project di Vercel**:
   - Buka https://vercel.com
   - Klik **"Add New Project"**
   - Pilih **"Import Git Repository"**
   - Pilih repository GitHub Anda
   - Klik **"Import"**

3. **Configure project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: **./** (default)
   - Build Command: **npm run build** (default)
   - Output Directory: **.next** (default)
   - Install Command: **npm install** (default)

4. **Deploy**:
   - Klik **"Deploy"**
   - Vercel akan otomatis build dan deploy
   - Setiap push ke GitHub akan auto-deploy

---

## Metode 3: Via Vercel Dashboard (Drag & Drop)

1. **Build project lokal**:
   ```bash
   npm run build
   ```

2. **Buka Vercel Dashboard**:
   - https://vercel.com/dashboard
   - Klik **"Add New Project"**
   - Pilih **"Upload"**

3. **Upload folder `.next`**:
   - Drag & drop folder `.next` yang sudah di-build
   - Atau upload sebagai zip

**Note**: Metode ini kurang recommended karena tidak ada auto-deploy

---

## Konfigurasi Tambahan

### Environment Variables (jika diperlukan):
1. Di Vercel Dashboard → Project Settings → Environment Variables
2. Tambahkan variables yang diperlukan

### Custom Domain:
1. Di Vercel Dashboard → Project Settings → Domains
2. Tambahkan domain custom Anda

### Build Settings:
File `vercel.json` sudah ada dengan konfigurasi:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

---

## Troubleshooting

### Error: Build failed
- Pastikan semua dependencies terinstall: `npm install`
- Cek `package.json` untuk dependencies yang benar
- Pastikan Node.js version compatible (Vercel menggunakan Node 18+)

### Error: Module not found
- Pastikan semua file ada di repository
- Cek `.gitignore` tidak mengabaikan file penting

### Error: Three.js issues
- Pastikan `three` dan `@types/three` ada di dependencies
- Vercel akan otomatis install dependencies saat build

---

## Tips

1. **Gunakan GitHub Integration** untuk auto-deploy setiap push
2. **Setup preview deployments** untuk test sebelum production
3. **Monitor build logs** di Vercel Dashboard jika ada error
4. **Gunakan Vercel Analytics** untuk track performance (optional)

---

## Quick Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove
```

