require('dotenv').config()
const path = require('path');
const flash = require('flash');
const StreamZip = require('node-stream-zip');
const express = require('express');
const bodyParser = require('body-parser');
const resumable = require('./resumable')('/tmp');
const multipart = require('connect-multiparty');
const xss = require('xss');
const home = require('./views/home');
const upload = require('./views/upload');
const manga = require('./views/manga');
const reader = require('./views/reader');
const user = require('./views/user');
const create = require('./views/create');
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
    secret: process.env.SECRET
  }))
  .use(flash())
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(express.static('public'))
  .use('/assets', express.static(path.join(process.env.FILES_ROOT, 'assets')))
  .get('/*', function(req, res, next) {
    req.session.flash = [];
    next();
  })
  .get('/', async (req, res) => {
    let query = 'SELECT * FROM manga ';
    let params = [];
    if (req.query.q) {
      query += `WHERE to_tsvector('english', eng_title || ' ' || romaji_title || ' ' || author || ' ' || artist || ' ' || romaji_title) @@ websearch_to_tsquery($1) `;
      params.push(req.query.q)
    }
    query += 'LIMIT 25';

    const results = await db.query(query, params);
    res.send(home({
      req: req,
      results: results.rows,
      flash: res.locals.flash
    }))
  })
  .get('/users/:id', async (req, res) => {
    const account_results = await db.query('SELECT * FROM accounts WHERE id = $1', [req.params.id]);
    if (!account_results.rows.length) return res.flash(`That user doesn't exist.`).redirect('back');

    const upload_results = await db.query('SELECT * FROM uploads WHERE uploader = $1', [req.params.id]);

    const manga_results = await Promise.map(upload_results.rows, async upload => {
      const account = await db.query('SELECT * FROM manga WHERE id = $1', [upload.manga_id])
      return account.rows[0]
    })
    
    res.send(user({
      req: req,
      account: account_results.rows[0],
      uploads: upload_results.rows,
      manga: manga_results,
      flash: res.locals.flash
    }))
  })
  .get('/manga/:id', async (req, res) => {
    const results = await db.query('SELECT * FROM manga WHERE id = $1', [req.params.id]);
    const upload_results = await db.query('SELECT * FROM uploads WHERE manga_id = $1', [req.params.id]);

    const uploader_results = await Promise.map(upload_results.rows, async upload => {
      if (upload.uploader > 0) {
        const account = await db.query('SELECT * FROM accounts WHERE id = $1', [upload.uploader])
        return account.rows[0].username
      } else {
        return null;
      }
    })

    res.send(manga({
      req: req,
      results: results.rows,
      uploads: upload_results.rows.sort((a, b) => a['volume_id'] - b['volume_id'] || a['chapter_id'] - b['chapter_id']),
      uploaders: uploader_results,
      flash: res.locals.flash
    }))
  })
  .get('/release/:id', (req, res) => {
    res.send(reader({ req: req }));
  })
  .get('/upload', (req, res) => {
    if (!req.session || !req.session.account_id) return res.redirect('/login')
    return res.send(upload({
      req: req,
      flash: res.locals.flash
    }))
  })
  .get('/create', (req, res) => {
    if (!req.session || !req.session.account_id) return res.redirect('/login')
    return res.send(create({
      req: req,
      flash: res.locals.flash
    }))
  })
  .get('/login', (req, res) => {
    res.send(login({
      req: req,
      flash: res.locals.flash
    }))
  })
  .get('/register', (req, res) => res.send(register({
    req: req,
    flash: res.locals.flash
  })))
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
  .post('/api/upload', multipart(), async (req, res) => {
    if (!req.session.account_id) return res.sendStatus(401);
    if (!req.body.manga_id) return res.status(415).send('Missing manga ID.');
    if (!req.body.chapter) return res.status(415).send('Missing chapter.');
    if (!req.files.file) return res.status(415).send('Missing file.')

    resumable.post(req, (status, filename, original_filename, identifier) => {
      if (status === 'done') {
        const stream = fs.createWriteStream('/tmp/' + filename);
        resumable.write(identifier, stream);
        stream.once('finish', async () => {
          const file_path = '/tmp/' + filename;
          let manga_id = parseInt(req.body.manga_id);
          const zip = new StreamZip.async({ file: file_path });
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
            if (!_img_type) return;
            if (!/(gif|jpe?g|png)/i.test(_img_type.ext)) return;
            const dimensions = await sizeOf(path.join(process.env.FILES_ROOT, 'assets', 'temp', temp_name));
            if (dimensions.width > 10000 || dimensions.height > 10000) return res.status(415).send('There was an image in your ZIP that was too large. Resolution limit is 10000x10000.');
            const hash = await hasha.fromFile(path.join(process.env.FILES_ROOT, 'assets', 'temp', temp_name), { algorithm: 'md5' });

            await fs.move(path.join(process.env.FILES_ROOT, 'assets', 'temp', temp_name), path.join(process.env.FILES_ROOT, 'assets', hash + '.' + _img_type.ext))
              .catch(() => {})
            await fs.remove(path.join(process.env.FILES_ROOT, 'assets', 'temp', temp_name))
            return hash + '.' + _img_type.ext  
          })
        
          await zip.close();
          await fs.remove(file_path);
        
          const schema = {
            manga_id: manga_id,
            volume_id: req.body.volume || 0,
            chapter_id: req.body.chapter,
            source: xss(req.body.source),
            uploader: req.session.account_id,
            images: hashed_entries
          }

          await db.query(`INSERT INTO uploads (${Object.keys(schema).join(', ')}) VALUES (${Object.values(schema).map((_, i) => `$${i + 1}`).join(', ')})`, Object.values(schema))
          res.send(status)
        });
      } else {
        res.send(status)
      }
    })
  })
  .post('/api/create', file_upload.single('cover'), async (req, res) => {
    if (!req.file) return res.flash('Missing cover image.').redirect('back');
    const buffer = await read_chunk(req.file.path, 0, img_type.minimumBytes)
    const _img_type = img_type(buffer);
    if (!_img_type) return res.flash('That manga cover was not an image.').redirect('back');
    if (!/(gif|jpe?g|png)/i.test(_img_type.ext)) return res.flash('That manga cover was not a supported image. JPG/GIF/PNG only.').redirect('back');
    const dimensions = await sizeOf(req.file.path);
    if (dimensions.width > 10000 || dimensions.height > 10000) return res.flash('That manga cover was too large. Resolution limit is 10000x10000.').redirect('back');
    const cover_hash = await hasha.fromFile(req.file.path, { algorithm: 'md5' });
    await fs.move(req.file.path, path.join(process.env.FILES_ROOT, 'assets', cover_hash + '.' + _img_type.ext))
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

    res.flash('Success!').redirect('/manga/' + manga_id)
  })
  .get('/api/logout', (req, res) => {
    req.session.account_id = null;
    res.redirect('back');
  })
  .post('/api/register', async (req, res) => {
    if (!req.body.username || !req.body.password || !req.body.confirm) return res.sendStatus(401);

    const username = xss(req.body.username);
    const password = req.body.password;
    const c_password = req.body.confirm;

    if (username.trim() === '') return res.flash('Username cannot be empty.').redirect('back');
    if (password.trim() === '') return res.flash('Password cannot be empty.').redirect('back');
    if (password !== c_password) return res.flash('Passwords do not match.').redirect('back');
    const account_results = await db.query('SELECT * FROM accounts WHERE username = $1', [username]);
    if (account_results.rows.length) return res.flash('Username taken.').redirect('back');

    const pw_hash = await bcrypt.hash(password, 10);
    const account_data = {
      username: username,
      password_hash: pw_hash
    }
    const id_data = await db.query(`INSERT INTO accounts (${Object.keys(account_data).join(', ')}) VALUES (${Object.values(account_data).map((_, i) => `$${i + 1}`).join(', ')}) returning id`, Object.values(account_data))
    req.session.account_id = id_data.rows[0].id

    res.flash('Successfully registered. Welcome to Ramune, ' + username + '!').redirect('/')
  })
  .post('/api/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const account_results = await db.query('SELECT * FROM accounts WHERE username = $1', [username]);
    if (!account_results.rows.length) return res.flash('Incorrect username or password.').redirect('back');

    const is_password_correct = await bcrypt.compare(password, account_results.rows[0].password_hash);
    if (!is_password_correct) return res.flash('Incorrect username or password.').redirect('back');

    req.session.account_id = account_results.rows[0].id;
    res.flash('Successfully logged in!').redirect('/')
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
  .get('/api/manga/:id', async (req, res) => {
    const manga_rows = await db.query('SELECT * FROM manga WHERE id = $1', [req.params.id]);
    res.json(manga_rows.rows);
  })
  .get('/api/manga/:id/releases', async (req, res) => {
    const manga_rows = await db.query('SELECT * FROM uploads WHERE manga_id = $1', [req.params.id]);
    res.json(manga_rows.rows);
  })
  .listen(process.env.PORT || 9001)