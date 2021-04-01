require('dotenv').config()
const migrations = require('db-migrate');
(async () => {
  const _migrations = migrations.getInstance(true, {
    config: {
      dev: {
        driver: 'pg',
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      }
    }
  })

  await _migrations.up();
})()