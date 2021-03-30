const { db } = require('../db');
(async () => {
  const schema = {
    eng_title: 'Nichijou',
    romaji_title: 'Nichijou',
    author: 'Keiichi Arawi',
    artist: 'Keiichi Arawi',
    description: "While the title suggests a story of simple, everyday school life, the contents are more the opposite. The setting is a strange school where you may see the principal wrestle a deer or a robot's arm hide a rollcake. However there are still normal stories, like making a card castle or taking a test you didn't study for. The art style is cute but mixes with extreme expressions and action sequences for surprising comedy bits.",
    cover: 'test.png',
  }

  // const schema = {
  //   eng_title: "Miss Kobayashi's Dragon Maid",
  //   romaji_title: 'Kobayashi-san Chi no Meidoragon',
  //   author: 'Coolkyousinnjya',
  //   description: "As office worker and programmer Kobayashi gets ready for work, she is greeted by a large dragon right outside her front door. The dragon immediately transforms into a human girl in a maid outfit, and introduces herself as Tohru. It turns out, that during a drunken excursion into the mountains the night before, Kobayashi had encountered the dragon, who claimed to have come from another world. Subsequently, Kobayashi had removed a holy sword from Tohru's back, earning her gratitude. With Tohru having no place to stay, Kobayashi offers to let the dragon stay at her home and become her personal maid, to which she agrees.",
  //   cover: 'anothertest.jpg'
  // }

  await db.query(`INSERT INTO manga (${Object.keys(schema).join(', ')}) VALUES (${Object.values(schema).map((_, i) => `$${i + 1}`).join(', ')})`, Object.values(schema))
})()