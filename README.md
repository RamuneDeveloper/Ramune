A (WIP) manga CMS developed by /a/ and /g/ as an alternative/successor to MangaDex.

### Running
Requires Postgres, Yarn, and Node.js. Docker setup coming soon.

```sh
yarn
yarn global add db-migrate
cp .env.example .env # then open .env and configure
cp database.json.example database.json # then open database.json and configure
db-migrate up
# you might want to run the scripts in "testing-scripts" here to populate the database
yarn run dev
```

### To-do before public release
This is MVP stuff; more features will be considered and implemented latter.

- [x] Uploading
- [x] Downloading
- [x] Manga search
- [ ] Columns for volumes (instead of just chapters)