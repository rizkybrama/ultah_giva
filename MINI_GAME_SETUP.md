# Mini Game 3D Setup Instructions

## Instalasi Three.js

Untuk menjalankan mini game 3D, Anda perlu menginstall Three.js terlebih dahulu:

```bash
# Menggunakan npm
npm install three @types/three

# Atau menggunakan yarn
yarn add three @types/three
```

## Catatan Penting

1. **Node.js Version**: Pastikan Node.js versi >= 18.17.0
   - Jika error saat install, update Node.js terlebih dahulu

2. **File Audio**: Pastikan file `ayaya.mp3` ada di folder `public/audio/`

3. **Optimasi Mobile**: 
   - Mini game sudah dioptimasi untuk mobile
   - Gunakan kontrol virtual di layar untuk mobile
   - Keyboard controls untuk desktop

## Fitur Mini Game

- ✅ Karakter 3D yang bisa bergerak (WASD / Arrow Keys)
- ✅ Rumah dengan interior sederhana
- ✅ Objek interaktif:
  - 🛏️ Bed (Rest & Dream)
  - 📺 TV (Memory Slideshow)
  - 💌 Letter (Romantic Message)
  - 🌸 Flower (Flower Meaning)
  - 🎂 Cake (Birthday Wish)
  - 🎁 Gift Box (Selected Coupons)
- ✅ Mobile controls (virtual joystick)
- ✅ Pastel premium theme
- ✅ Integrasi dengan state global (coupons, messages)

## Troubleshooting

Jika Three.js tidak ter-load:
1. Pastikan sudah install: `npm install three @types/three`
2. Restart development server: `npm run dev`
3. Check browser console untuk error details




