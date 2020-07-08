const express = require('express');
const app = express();
const PORT = 3000;
const cookieParser = require('cookie-parser')

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

function generateRandomString() {
  for (let i = 0; i < 100; i++) {
    let string = Math.random().toString(36).slice(2);
    let strArr = string.split("").splice(5).join("");
    if (strArr.length === 6) {
      return strArr;
    }
  }
};

function emailLookup(email) {
  let result = [];
  for (const user in users) {
    result.push(users[user].email);
  }
  if (result.includes(email)) {
    return result;
  } else {
    return false;
  }
};

app.set('view engine', 'ejs');

app.get('/',(req,res) => {
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] }
  res.render("urls_new", templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] }
  res.render('register', templateVars);
});

app.post('/register',(req,res) => {
  let userID = generateRandomString();
  const email = req.body.email;
  const pass = req.body.password;
  const templateVars = { Error: 'Invalid Username or Password' };
  if (emailLookup(email)) {
    res.status(400).send('Username already exists! <a href="/login">Login Instead</a>');
  } else if (!email || !pass) {
    res.status(400).send('Invalid Username or Password <a href="/register">Try Again</a>');
  } else {
    users[userID] = { id: userID, email: email, password: pass };
    res.cookie('user_id', userID);
    res.redirect('/urls');
  }
});

app.post('/urls',(req,res) => {
  let uID = generateRandomString();
  urlDatabase[uID] = req.body.longURL;
  // let templateVars = { shortURL: uID };
  res.redirect(302,`/urls/${uID}`);
});

app.post('/urls/:shortURL/delete',(req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(302,'/urls');
});

app.post('/login', (req,res) => {
  const userEmail = req.body.user_email;
  const userPass = req.body.user_pass;
  for (const user in users) {
    if (users[user].email === userEmail && users[user].password === userPass) {
      res.cookie('user_id', users[user].id);
      res.redirect('/urls');
    } else {
      res.redirect('/login');
    }
  }
  
});

app.get('/login',(req,res) => {
  const templateVars = { user: users[req.cookies.user_id] }
  res.render('login',templateVars);
});

app.post('/logout',(req,res) => {
  // console.log('hmm');
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/urls.json',(req,res) => {
  res.json(urlDatabase);
});

app.get('/urls',(req,res) => {
  res.render('urls_index',{ urlDatabase, user: users[req.cookies.user_id] });
});

app.get('/urls/:shortURL',(req,res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id]
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/update',(req,res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('back');
});

app.get('/u/:shortURL',(req,res) => {
  // let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.redirect(urlDatabase[req.params.shortURL]);
});




app.listen(PORT,() => {
  console.log(`Tinyapp listening on http://localhost:${PORT}`);
});