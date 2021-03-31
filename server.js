require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const xss = require('xss');
const home = require('./views/home');
const upload = require('./views/upload');
const manga = require('./views/manga');
const reader = require('./views/reader');
const bcrypt = require('bcrypt');
const { db } = require('./db');
const cookieSession = require('cookie-session');
const login = require('./views/login');
const register = require('./views/register');

function sortObject(obj) {
  return Object.keys(obj).sort().reduce(function (result, key) {
    result[key] = obj[key];
    return result;
  }, {});
}

express()
  .use(cookieSession({
    name: 'session',
    secret: 'YvLRGScBvEywok6daMa87pQWjv5XvS'
  }))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(express.static('public'))
  .use('/assets', express.static('assets'))
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
      uploads[row.manga_id] = uploads[row.manga_id] ? [].concat(uploads[row.manga_id], row) : [row]
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
    if (!account_results.rows.length) return res.status(401).send('That user doesn\'t exist.');

    const is_password_correct = await bcrypt.compare(password, account_results.rows[0].password_hash);
    if (!is_password_correct) return res.status(401).send('Incorrect password.');

    req.session.account_id = account_results.rows[0].id;
    res.redirect('/')
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