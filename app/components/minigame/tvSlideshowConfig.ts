// TV Slideshow Configuration
// Edit urutan dan dialog di sini untuk mengubah slideshow

import type { DialogMessage } from './dialogSystem';

export interface TVSlideItem {
  type: 'image' | 'video'; // Support untuk image dan video
  url: string; // URL untuk image atau video
  dialogs: DialogMessage[];
}

export const tvSlideshowConfig: TVSlideItem[] = [
  {
    type: 'video',
    url: '/video/video-1.mp4',
    dialogs: [
      {
        speaker: 'Erbe',
        text: 'Ayo tebak ini di mana?'
      },
      {
        speaker: 'Erbe',
        text: 'Apakah jawaban kamu benar? wkwk hmm jadi ini di blok M sayang, awal cerita kita ketemu, aku diem diem ngevideoin kamu dari belakang karena gaberani kan ngajak fotbar atau video dari depan wkwk, maap ya, but meskipun momen momen ini diambil diam diam, tapi itu bakal diam diam jadi saksi bisu kita dalam mengawali hubungan, anjay'
      }
    ]
  },
  {
    type: 'image',
    url: '/images/giva-20.jpeg',
    dialogs: [
      {
        speaker: 'Erbe',
        text: 'Kalo ngga salah ini kali kedua kita ketemu, pas itu kamu ngajak ketemuan trus tanya ke aku, kamu kok mau aku ajak ketemuan lagi? jawabanku, kenapa nggak wkwkk tp aku masih bertanya-tanya, kenapa kamu tanya gitu?'
      }
    ]
  },
  {
    type: 'image',
    url: '/images/giva-5.jpeg',
    dialogs: [
      {
        speaker: 'Erbe',
        text: 'Pas ini ayang cantik banget, bajunya bagus, apakah ini baju thrifting? wkwk tp aku merasa happy pas dirayain seperti ini, lalala lilili dan kenapa ayang sampe mau traktir aku, aku pun tak paham, but luvyu wwkkw mewhehehe'
      }
    ]
  },
  {
    type: 'image',
    url: '/images/giva-1.jpeg',
    dialogs: [
      {
        speaker: 'Erbe',
        text: 'Panggil aku penjual kerak telor 🌸'
      }
    ]
  },
  {
    type: 'image',
    url: '/images/giva-3.jpeg',
    dialogs: [
      {
        speaker: 'Erbe',
        text: 'Panggil aku pelari kalcer 😂'
      }
    ]
  },
  {
    type: 'image',
    url: '/images/giva-6.jpeg',
    dialogs: [
      {
        speaker: 'Erbe',
        text: 'Lihat bajunya mirip kek karakter giva sekarang, walaupun tak berbentuk, minimal mirip kancingnya, ayang cantik number 2 💕'
      }
    ]
  },
  {
    type: 'image',
    url: '/images/giva-4.jpeg',
    dialogs: [
      {
        speaker: 'Erbe',
        text: 'Kopken dulu ayanggg auuu 😄'
      }
    ]
  },
  {
    type: 'image',
    url: '/images/giva-7.jpeg',
    dialogs: [
      {
        speaker: 'Erbe',
        text: 'Matanya sembab kasian ._.🍦 tapi tambah cantik katanya wkwk'
      }
    ]
  },
  {
    type: 'image',
    url: '/images/giva-9.jpeg',
    dialogs: [
      {
        speaker: 'Erbe',
        text: 'Agak kecewa karena cmn naikin dikit wahana karena waktunya mepet, tp yaudahlah, ingat kata dokter indonesia, kita sudah berusaha semaksimal mungkin 📖'
      }
    ]
  },
  {
    type: 'image',
    url: '/images/giva-10.jpeg',
    dialogs: [
      {
        speaker: 'Erbe',
        text: 'Sembab number 2" 🌅'
      }
    ]
  },
  {
    type: 'image',
    url: '/images/giva-11.jpeg',
    dialogs: [
      {
        speaker: 'Erbe',
        text: 'Lucunyaaaa 😆'
      }
    ]
  },
  {
    type: 'image',
    url: '/images/giva-8.jpeg',
    dialogs: [
      {
        speaker: 'Erbe',
        text: 'Cemil cemil di GBK meski zonk 🥰'
      }
    ]
  },
  {
    type: 'image',
    url: '/images/giva-16.jpeg',
    dialogs: [
      {
        speaker: 'Erbe',
        text: 'Makan di dapurnya jokeswi'
      }
    ]
  },
  {
    type: 'image',
    url: '/images/erbe-1.jpeg',
    dialogs: [
      {
        speaker: 'Erbe',
        text: 'Selamat ultah ayangkuuu wkw'
      }
    ]
  },
  
  
  // Contoh menambahkan video dengan dialog:
  // {
  //   type: 'video',
  //   url: '/video/memories.mp4', // Path ke video file
  //   dialogs: [
  //     {
  //       speaker: 'Erbe',
  //       text: 'Ini video kenangan kita waktu liburan 🎬'
  //     }
  //   ]
  // }
];

