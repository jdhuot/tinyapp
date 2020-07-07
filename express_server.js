const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  for (let i = 0; i < 100; i++) {
    let string = Math.random().toString(36).slice(2);
    let strArr = string.split("").splice(5).join("");
    if (strArr.length === 6) {
      return strArr;
    }
  }
};

app.set('view engine', 'ejs');

app.get('/',(req,res)=> {
  res.send('Hello!');
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post('/urls',(req,res) => {
  let uID = generateRandomString();
  urlDatabase[uID] = req.body.longURL;
  console.log(urlDatabase);
  // let templateVars = { shortURL: uID };
  res.redirect(302,`/urls/${uID}`);
});

app.get('/urls.json',(req,res) => {
  res.json(urlDatabase);
});

app.get('/urls',(req,res) => {
  res.render('urls_index',{ 'urlDatabase': urlDatabase });
});

app.get('/urls/:shortURL',(req,res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL',(req,res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.redirect(302,urlDatabase[req.params.shortURL]);
});

app.get('/hello',(req,res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT,() => {
  console.log(`Tinyapp listening on localhost:${PORT}`);
});