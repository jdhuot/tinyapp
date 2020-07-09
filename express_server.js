const express = require('express');
const app = express();
const PORT = 3000;
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" }, 
  '9sm5xK': { longURL: "http://www.google.com", userID: "userRandomID" } 
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync('123', 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync('456', 10)
  },
  "user3RandomID": {
     id: "user3RandomID", 
     email: "user3@mail.com", 
     password: bcrypt.hashSync('456', 10)
   }
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

function urlsForUser(id) {
  let result = {};
  for (const links in urlDatabase) {
    if (urlDatabase[links].userID === id) {
      result[links] = urlDatabase[links];
    }
  }
  if (Object.keys(result).length > 0) {
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
  if (req.cookies.user_id in users) {
    res.render("urls_new", templateVars);
  } else {
    res.status(400).send("Sorry bub, only logged in users can shorten urls.. feel free to login if you're one! <a href='/login'>Login here</a>");
  }
});

app.get('/register', (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] }
  res.render('register', templateVars);
});

app.post('/register',(req,res) => {
  let userID = generateRandomString();
  const email = req.body.email;
  const pass = req.body.password;
  const hashedPassword = bcrypt.hashSync(pass, 10);
  if (emailLookup(email)) {
    res.status(400).send('Username already exists! <a href="/login">Login Instead</a>');
  } else if (!email || !pass) {
    res.status(400).send('Invalid Username or Password <a href="/register">Try Again</a>');
  } else {
    users[userID] = { id: userID, email: email, password: hashedPassword };
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
  const usrID = req.cookies['user_id']
  if (usrID === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(302,'/urls');
  } else {
    res.status(400).send("You don't have persmission.. return to your own <a href='/urls'>URLS</a>");
  }
});

app.post('/login', (req,res) => {
  const userEmail = req.body.user_email;
  const userPass = req.body.user_pass;
  for (const user in users) {
    if (!emailLookup(userEmail)) {
      res.status(403).send("Hmm.. That username can't be found, <a href='/login'>Try again</a>");
    } else if (users[user].email === userEmail && !bcrypt.compareSync(userPass, users[user].password)) {
      res.status(403).send("Hmm.. That password doesn't match our records, <a href='/login'>Try again</a>");
    } else if (users[user].email === userEmail && bcrypt.compareSync(userPass, users[user].password)) {
      res.cookie('user_id', users[user].id);
      res.redirect('/urls');
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
  const links = urlsForUser(req.cookies.user_id);
  if (req.cookies.user_id) {
    res.render('urls_index',{ urlDatabase, user: users[req.cookies.user_id], links });
  } else {
    res.render('urls_index_blank',{ urlDatabase, user: users[req.cookies.user_id] });
  }
  
});

app.get('/urls/:shortURL',(req,res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_id]
  };
  const links = urlsForUser(req.cookies.user_id);
  if (links) {
    res.render('urls_show', templateVars);
  } else {
    res.render('urls_index_blank',templateVars);
  }
  
});

app.post('/urls/:shortURL/update',(req,res) => {
  const usrID = req.cookies['user_id']
  if (usrID === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('back');
  } else {
    res.status(400).send("You don't have persmission.. return to your own <a href='/urls'>URLS</a>");
  }

});

app.get('/u/:shortURL',(req,res) => {
  // let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});




app.listen(PORT,() => {
  console.log(`Tinyapp listening on http://localhost:${PORT}`);
});