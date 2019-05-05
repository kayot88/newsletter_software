const fs = require('fs');
const express = require('express');
const app = express();
require('dotenv').config({ path: '.env' });
const { check } = require('express-validator/check');
const { createJWT, verifyJWT } = require('./auth');
const cookieParser = require('cookie-parser');
const Airtable = require('airtable');
const ta = require('time-ago');
var base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  'appsx3M1IST1yDiVG'
);
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

app.get('/admin', () => {
base('Signup')
  .select({
    view: 'Grid view'
  })
  .eachPage(
    function page(records, fetchNextPage) {
      records.forEach(function(record) {
        console.log('Retrieved', record.get('Name'));
      });
      fetchNextPage();
    },
    function done(err) {
      if (err) {
        console.error(err);
        return;
      }
    }
  );
});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post(
  '/form',
  [
    check('name')
      .isAlpha()
      .isLength({ min: 3, max: 100 }),
    check('email').isEmail()
  ],
  (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const date = new Date().toISOString();
    base('Signup').create(
      {
        Name: name,
        Email: email,
        Date: date
      },
      function(err, record) {
        if (err) {
          console.error(err);
          return;
        }
        console.log(record.getId());
      }
    );
    res.end();
  }
);

app.listen(process.env.PORT, () => {
  console.log(`Server runned on ${process.env.PORT} port`);
});
