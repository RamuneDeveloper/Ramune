const { db } = require('../db');
(async () => {
  const schema = {
    manga_id: 1,
    chapter_id: 1,
    source: 'Dekai Manga Archive [Musashi Quality]',
    uploader: 0,
    images: [
      '001.jpg',
      '002.jpg',
      '003.jpg',
      '004.jpg',
      '005.jpg',
      '006.jpg',
      '007.jpg',
      '008.jpg',
      '009.jpg',
      '010.jpg',
      '011.jpg',
      '012.jpg',
      '013.jpg',
      '014.jpg',
      '015.jpg',
      '016.jpg'
    ]
  }

  await db.query(`INSERT INTO uploads (${Object.keys(schema).join(', ')}) VALUES (${Object.values(schema).map((_, i) => `$${i + 1}`).join(', ')})`, Object.values(schema))
})()