const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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

app.get('/',(req,res) => {
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies.username }
  res.render("urls_new", templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { username: req.cookies.username }
  res.render('register', templateVars);
});

// app.post('/register',(req,res) => {
//   const email = req.body.email;
//   const pass = req.body.password;
//   res.cookie('username',email);
//   res.cookie('password',pass);
//   res.redirect('/urls');
// });

app.post('/urls',(req,res) => {
  let uID = generateRandomString();
  urlDatabase[uID] = req.body.longURL;
  console.log(urlDatabase);
  // let templateVars = { shortURL: uID };
  res.redirect(302,`/urls/${uID}`);
});

app.post('/urls/:shortURL/delete',(req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(302,'/urls');
});

app.post('/login', (req,res) => {
  res.cookie('username', req.body.username);/*req.cookie.username*/
  res.redirect('/urls');
});

app.post('/logout',(req,res) => {
  // console.log('hmm');
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/urls.json',(req,res) => {
  res.json(urlDatabase);
});

app.get('/urls',(req,res) => {
  res.render('urls_index',{ urlDatabase, username: req.cookies.username });
});

app.get('/urls/:shortURL',(req,res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username 
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/update',(req,res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('back');
});

app.get('/u/:shortURL',(req,res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.redirect(302,urlDatabase[req.params.shortURL]);
});




app.listen(PORT,() => {
  console.log(`Tinyapp listening on localhost:${PORT}`);
});