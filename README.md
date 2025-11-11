# Website Ucapan Ulang Tahun Romantis 💖

Website romantis dengan tema Pastel Premium untuk ucapan ulang tahun pacar.

## Fitur

- 🕰️ **Halaman Countdown** dengan timer real-time
- 💌 **Halaman Hero** dengan pertanyaan "Do you love me?" dan tanggal ulang tahun
- 😠 **Halaman Mood Storm** (muncul jika klik "No")
- 📸 **Timeline Kenangan** dengan scroll reveal
- 🎟️ **Halaman Kupon** - pilih 2 dari 6 kupon ulang tahun
- 🎂 **Halaman Kue Interaktif** dengan animasi lilin dan love hearts terbang
- 🌸 **Halaman Bunga & Makna** - Lily dengan 3 pin interaktif
- 💖 **Halaman Akhir** dengan animasi typewriter dan ringkasan kupon
- 🎵 **Kontrol Musik Global** dengan tombol Play/Pause floating

## Teknologi

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Animasi CSS custom

## Setup

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Buka [http://localhost:3000](http://localhost:3000)

## Kustomisasi

### Mengubah Nama Pacar & Tanggal Ulang Tahun
Edit file `app/config.ts` untuk mengubah:
- Nama pacar (`girlfriendName`)
- Tanggal ulang tahun (`birthdayDate`)
- Pesan romantis di halaman akhir (`finalMessage`)
- Nomor WhatsApp (`whatsappNumber`) - format: 62XXXXXXXXXX (tanpa +)

### Menambahkan Foto Kenangan
1. Buat folder `public/images/`
2. Letakkan foto Anda di folder tersebut
3. Edit file `app/components/TimelinePage.tsx` pada array `memories` dan uncomment bagian `<img>` tag

### Menambahkan Musik
1. Buat folder `public/audio/`
2. Letakkan file musik (format MP3) dengan nama `romantic-music.mp3`
3. Atau edit file `app/page.tsx` untuk menggunakan URL musik eksternal

### Menambahkan Link Spotify
Edit file `app/components/MusicControl.tsx` dan tambahkan prop `spotifyUrl`:
```tsx
<MusicControl audioRef={audioRef} spotifyUrl="https://open.spotify.com/..." />
```

### Mengatur Nomor WhatsApp
Edit file `app/config.ts` pada field `whatsappNumber`:
```typescript
whatsappNumber: '6281234567890', // Format: 62XXXXXXXXXX (tanpa +)
```
Nomor ini akan digunakan untuk tombol "Kirim Peluk 🤍" di halaman akhir yang membuka WhatsApp dengan pesan otomatis.

## Alur Halaman

1. **Countdown** → Countdown timer atau tombol "Mulai Perayaan & Musik"
2. **Hero** → Greeting + pertanyaan "Do you love me?"
   - **Yes** → Timeline
   - **No** → Mood Storm → kembali ke Hero
3. **Timeline** → Kenangan dengan scroll reveal → tombol "Lanjut ke Kue 🎂"
4. **Cake** → Kue interaktif dengan lilin & love hearts → tombol "Pilih Kupon Hadiah 🎁"
5. **Coupons** → Pilih 3 kupon (Dinner date pre-selected, pilih 2 lagi)
6. **Flowers** → Lily dengan 3 pin tooltip
7. **Final** → Pesan dengan typewriter animation + ringkasan kupon + tombol WhatsApp

## Fitur Interaktif

### Halaman Kupon
- **Dinner date** sudah pre-selected & locked dengan badge "Chosen by me"
- User harus memilih tepat 3 kupon total (Dinner date + 2 pilihan user)
- Counter menampilkan "Selected: X / 3" (mulai dari 1)
- Helper text: "Kamu bisa memilih 3 dari 6 hadiah berikut. 'Dinner date' sudah aku pilih untuk kita—jadi kamu tinggal pilih 2 lagi ya."
- Toast message: "You can only add two more, love." jika mencoba pilih lebih dari 3
- Kupon terpilih ditampilkan di halaman akhir dengan label khusus untuk Dinner date

### Halaman Kue
- Klik lilin untuk meniup
- Animasi love hearts terbang ke atas saat lilin padam
- Teks "Make a wish..." muncul setelah animasi

### Halaman Bunga
- 1 bunga Lily besar dengan 3 pin interaktif
- Klik pin untuk melihat tooltip dengan makna
- Tooltip memiliki animasi fade + scale-in
- Klik di luar untuk menutup tooltip

### Halaman Akhir
- Animasi typewriter untuk teks utama
- Ikon tangan menulis bergerak saat animasi
- Tombol "Skip animation" untuk skip
- Ringkasan 3 kupon yang dipilih (termasuk Dinner date dengan label "chosen by you")
- Tombol "Kirim Peluk 🤍" membuka WhatsApp dengan pesan otomatis berisi daftar kupon
- Confetti pastel jatuh

## Deploy ke Vercel

1. Push code ke GitHub
2. Import project ke Vercel
3. Deploy otomatis akan berjalan

Atau gunakan Vercel CLI:
```bash
npm i -g vercel
vercel
```

## Catatan

- Website ini menggunakan placeholder untuk foto dan musik. Ganti dengan konten asli Anda.
- Untuk audio autoplay, pastikan user sudah melakukan interaksi (klik tombol) terlebih dahulu.
- Pastikan semua gambar dioptimalkan untuk performa web.
- Semua animasi menggunakan CSS transform/opacity untuk performa optimal.
- Website fully responsive dan mobile-first.

---

Dibuat dengan ❤️ untuk Oliffia Larensza Geovani
