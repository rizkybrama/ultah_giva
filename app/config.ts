// Konfigurasi Website Ucapan Ulang Tahun
// Edit file ini untuk mengkustomisasi website

export const config = {
  // Nama pacar Anda
  girlfriendName: 'Oliffia Larensza Geovani',
  
  // Tanggal ulang tahun (format: YYYY-MM-DD, timezone WIB)
  birthdayDate: '2025-11-15T00:00:00+07:00', // 5 November 2025
  
  // Pesan romantis di halaman akhir
  finalMessage: {
    line1: 'Aku nggak butuh alasan besar untuk mencintaimu —',
    line2: 'cukup satu, kamu.',
    closing: 'Selamat ulang tahun, Oliffia. Semoga semua impianmu terwujud. 💕',
  },
  // Nomor WhatsApp (format: 62XXXXXXXXXX tanpa +)
  whatsappNumber: '62895637922432', // Ganti dengan nomor WhatsApp Anda
  
  // Avatar/Sticker untuk halaman countdown
  countdownAvatar: {
    // Pilih salah satu: gunakan emoji atau gambar
    useEmoji: true, // true = pakai emoji, false = pakai gambar
    // Emoji berbeda untuk countdown vs sudah tiba
    emojiWaiting: '⏳', // Emoji saat masih countdown (nunggu)
    emojiCelebration: '🎉', // Emoji saat sudah hari ulang tahun (perayaan)
    imagePath: '/images/sticker-avatar.gif', // Path ke gambar jika useEmoji = false
  },
  
  // Description text untuk halaman countdown (dinamis berdasarkan hari tersisa)
  countdownDescriptions: {
    h3: 'Kamu ngapain ke sini? wkwkwk nungguinnn yaaa? Bentar yaaaa, puhahahahah luvyuuu 💕', // H-3 (3 hari sebelum)
    h2: 'Ehhhh, bentar lagi ayangggg, tak sabarrr bgt bgt yuk yek yokkkkk unn grr 💕', // H-2 (2 hari sebelum)
    h1: 'Ayaanggg, besok kamu ultah, tunggu bentar lagiii rauuwwwrrrrrr 💕', // H-1 (1 hari sebelum)
    default: 'Sabar ya sayang, tunggu sebentar lagi. Waktunya akan tiba dan kita akan merayakannya bersama! 💕', // Lebih dari 3 hari
  },
};

