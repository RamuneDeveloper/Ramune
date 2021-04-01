require('dotenv').config()
const path = require('path');
const StreamZip = require('node-stream-zip');
const express = require('express');
const bodyParser = require('body-parser');
const xss = require('xss');
const home = require('./views/home');
const upload = require('./views/upload');
const manga = require('./views/manga');
const reader = require('./views/reader');
const hasha = require('hasha')
const read_chunk = require('read-chunk');
const img_size = require('image-size')
const img_type = require('image-type')
const yazl = require('yazl');
const crypto = require('crypto');
const Promise = require('bluebird');
const fs = require('fs-extra')
const multer = require('multer');
const bcrypt = require('bcrypt');
const { db } = require('./db');
const cookieSession = require('cookie-session');
const login = require('./views/login');
const register = require('./views/register');

const { promisify } = require('util')
const sizeOf = promisify(img_size)

function sortObject(obj) {
  return Object.keys(obj).sort().reduce(function (result, key) {
    result[key] = obj[key];
    return result;
  }, {});
}

const file_upload = multer({
  storage: multer.diskStorage({
    destination: path.join(process.env.FILES_ROOT, 'assets', 'temp')
  }),
  limits: {
    files: 2,
    fileSize: 5000000000 // 5GB
  },
  fileFilter: (_, file, cb) => {
    const allowed_mimes = [
      'image/jpeg',
      'image/png',
      'application/x-zip-compressed',
      'application/zip'
    ]
    cb(null, allowed_mimes.includes(file.mimetype))
  }
});

express()
  .use(cookieSession({
    name: 'session',
    secret: 'YvLRGScBvEywok6daMa87pQWjv5XvS'
  }))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(express.static('public'))
  .use('/assets', express.static(path.join(process.env.FILES_ROOT, 'assets')))
  .get('/', async (req, res) => {
    const results = await db.query('SELECT * FROM manga');
    res.send(home({
      req: req,
      results: results.rows
    }))
  })
  .get('/manga/:id', async (req, res) => {
    const results = await db.query('SELECT * FROM manga WHERE id = $1', [req.params.id]);
    const upload_results = await db.query('SELECT * FROM uploads WHERE manga_id = $1', [req.params.id]);
    const uploads = {}
    upload_results.rows.forEach(row => {
      uploads[row.chapter_id] = uploads[row.chapter_id] ? [].concat(uploads[row.chapter_id], row) : [row]
    });

    // const chapter_results = await db.query('SELECT * FROM chapters WHERE manga_id = $1', [req.params.id]);
    // const upload_results = await Promise.map(chapter_results.rows, async chapter => {
    //   const upload_rows = await db.query('SELECT * FROM uploads WHERE chapter_id = $1', [chapter.id]);
    //   return upload_rows.rows;
    // })
    
    res.send(manga({
      req: req,
      results: results.rows,
      uploads: sortObject(uploads)
    }))
  })
  .get('/release/:id', (req, res) => res.send(reader({ req: req })))
  .get('/upload', (req, res) => {
    if (!req.session || !req.session.account_id) return res.redirect('/login')
    return res.send(upload({ req: req }))
  })
  .get('/login', (req, res) => res.send(login({ req: req })))
  .get('/register', (req, res) => res.send(register({ req: req })))
  .get('/download/:id', async (req, res) => {
    const zip = new yazl.ZipFile();
    const upload_rows = await db.query('SELECT * FROM uploads WHERE id = $1', [req.params.id]);
    if (!upload_rows.rows.length) return res.sendStatus(404);
    await Promise.mapSeries(upload_rows.rows[0].images, async (image, i) => {
      const buffer = await read_chunk(path.join(process.env.FILES_ROOT, 'assets', image), 0, img_type.minimumBytes)
      const _img_type = img_type(buffer);
      zip.addFile(path.join(process.env.FILES_ROOT, 'assets', image), (i + 1) + '.' + _img_type.ext);
    });
    zip.end();
    zip.outputStream.pipe(res);
  })
  .post('/api/upload', file_upload.fields([
    { name: 'cover' },
    { name: 'upload_file' }
  ]), async (req, res) => {
    if (!req.session.account_id) return res.sendStatus(401)
    if (!req.body.new_manga && (!req.body.manga_id || !req.body.chapter)) return res.sendStatus(400);
    if (req.body.new_manga && (!req.body.eng_title || !req.body.description)) return res.sendStatus(400);
    if (req.body.new_manga && !req.files.cover) return res.sendStatus(400);
    if (!req.files.upload_file) return res.sendStatus(400);

    let manga_id = parseInt(req.body.manga_id);
    if (req.body.new_manga) {
      const buffer = await read_chunk(req.files.cover[0].path, 0, img_type.minimumBytes)
      const _img_type = img_type(buffer);
      if (!_img_type) return res.status(415).send('Encountered a non-image file.');
      if (!/(gif|jpe?g|png|webp)/i.test(_img_type.ext)) return res.status(422).send('Encountered unsupported image.');
      const dimensions = await sizeOf(req.files.cover[0].path);
      if (dimensions.width > 10000 || dimensions.height > 10000) return res.status(422).send('Encountered extremely large image. Resolution limit is 10000x10000.');
      const cover_hash = await hasha.fromFile(req.files.cover[0].path, { algorithm: 'md5' });
      await fs.move(req.files.cover[0].path, path.join(process.env.FILES_ROOT, 'assets', cover_hash + '.' + _img_type.ext))
        .catch(() => {})

      const schema = {
        eng_title: xss(req.body.eng_title),
        romaji_title: xss(req.body.romaji_title),
        author: xss(req.body.author),
        artist: xss(req.body.artist),
        description: xss(req.body.description),
        cover: cover_hash + '.' + _img_type.ext,
      }

      const manga_results = await db.query(`INSERT INTO manga (${Object.keys(schema).join(', ')}) VALUES (${Object.values(schema).map((_, i) => `$${i + 1}`).join(', ')}) returning id`, Object.values(schema))
      manga_id = manga_results.rows[0].id;
    }
    const zip = new StreamZip.async({ file: req.files.upload_file[0].path });
    const entries = await zip.entries();
    const sorted_entries = Object.values(entries)
      .filter(entry => !entry.isDirectory)
      .map(entry => entry.name)
      .sort();
    
    const hashed_entries = await Promise.mapSeries(sorted_entries, async entry => {
      const temp_name = crypto.randomBytes(5).toString('hex');
      await zip.extract(entry, path.join(process.env.FILES_ROOT, 'assets', 'temp', temp_name));
      const buffer = await read_chunk(path.join(process.env.FILES_ROOT, 'assets', 'temp', temp_name), 0, img_type.minimumBytes)
      const _img_type = img_type(buffer);
      if (!_img_type) return res.status(415).send('Encountered a non-image file.');
      if (!/(gif|jpe?g|png|webp)/i.test(_img_type.ext)) return res.status(422).send('Encountered unsupported image.');
      const dimensions = await sizeOf(path.join(process.env.FILES_ROOT, 'assets', 'temp', temp_name));
      if (dimensions.width > 10000 || dimensions.height > 10000) return res.status(422).send('Encountered extremely large image. Resolution limit is 10000x10000.');
      const hash = await hasha.fromFile(path.join(process.env.FILES_ROOT, 'assets', 'temp', temp_name), { algorithm: 'md5' });
      
      await fs.move(path.join(process.env.FILES_ROOT, 'assets', 'temp', temp_name), path.join(process.env.FILES_ROOT, 'assets', hash + '.' + _img_type.ext))
        .catch(() => {})
      await fs.remove(path.join(process.env.FILES_ROOT, 'assets', 'temp', temp_name))
      return hash + '.' + _img_type.ext  
    })

    await zip.close();
    await fs.remove(req.files.upload_file[0].path);

    const schema = {
      manga_id: manga_id,
      chapter_id: parseInt(req.body.chapter),
      source: xss(req.body.source),
      uploader: req.session.account_id,
      images: hashed_entries
    }
    
    await db.query(`INSERT INTO uploads (${Object.keys(schema).join(', ')}) VALUES (${Object.values(schema).map((_, i) => `$${i + 1}`).join(', ')})`, Object.values(schema))
    res.send('Success!')
  })
  .get('/api/logout', (req, res) => {
    req.session.account_id = null;
    res.redirect('back')
  })
  .post('/api/register', async (req, res) => {
    if (!req.body.username || !req.body.password || !req.body.confirm) return res.sendStatus(401);

    const username = xss(req.body.username);
    const password = req.body.password;
    const c_password = req.body.confirm;

    if (username.trim() === '') return res.status(400).send('Username cannot be empty.');
    if (password.trim() === '') return res.status(400).send('Password cannot be empty.');
    if (password !== c_password) return res.status(400).send('Passwords do not match.');
    const account_results = await db.query('SELECT * FROM accounts WHERE username = $1', [username]);
    if (account_results.rows.length) return res.status(409).send('Username taken.') // conflict

    const pw_hash = await bcrypt.hash(password, 10);
    const account_data = {
      username: username,
      password_hash: pw_hash
    }
    const id_data = await db.query(`INSERT INTO accounts (${Object.keys(account_data).join(', ')}) VALUES (${Object.values(account_data).map((_, i) => `$${i + 1}`).join(', ')}) returning id`, Object.values(account_data))
    req.session.account_id = id_data.rows[0].id

    res.redirect('/')
  })
  .post('/api/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const account_results = await db.query('SELECT * FROM accounts WHERE username = $1', [username]);
    if (!account_results.rows.length) return res.status(401).send('Incorrect username or password.');

    const is_password_correct = await bcrypt.compare(password, account_results.rows[0].password_hash);
    if (!is_password_correct) return res.status(401).send('Incorrect username or password.');

    req.session.account_id = account_results.rows[0].id;
    res.redirect('/')
  })
  .get('/api/autocomplete', async (req, res) => {
    if (!req.query.q) return res.sendStatus(400);
    const manga_rows = await db.query(`SELECT * FROM manga WHERE to_tsvector('english', eng_title || ' ' || romaji_title || ' ' || author || ' ' || artist || ' ' || romaji_title) @@ websearch_to_tsquery($1) LIMIT 10`, [req.query.q]);
    const manga_list = manga_rows.rows.map(row => {
      return {
        label: row.eng_title,
        value: row.id 
      }
    });
    res.json(manga_list);
  })
  .get('/api/release/:id', async (req, res) => {
    const upload_rows = await db.query('SELECT * FROM uploads WHERE id = $1', [req.params.id]);
    res.json(upload_rows.rows);
  })
  .get('/api/chapters/:id', async (req, res) => {
    const chapters_rows = await db.query('SELECT * FROM chapters WHERE id = $1', [req.params.id]);
    res.json(chapters_rows.rows);
  })
  .get('/api/manga/:id', async (req, res) => {
    const manga_rows = await db.query('SELECT * FROM manga WHERE id = $1', [req.params.id]);
    res.json(manga_rows.rows);
  })
  .listen(process.env.PORT || 9000)