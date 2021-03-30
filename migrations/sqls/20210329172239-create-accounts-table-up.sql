CREATE TABLE accounts (
  id serial primary key,
  username varchar not null,
  password_hash varchar not null,
  UNIQUE(username)
);