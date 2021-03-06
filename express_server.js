const express = require('express');
const app = express();
const PORT = 3000;
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUserByEmail, newDateFunc, generateRandomString, urlsForUser } = require('./helpers.js');
const bodyParser = require('body-parser');

// Configs
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['fefaoijfovrSFpofj0390949j0fijiadJ'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set('view engine', 'ejs');

// Pseudo Urls Database
const urlDatabase = {
  'b2xVn2': { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID", date: 'Thu Jul 05' },
  '9sm5xK': { longURL: "http://www.google.com", userID: "userRandomID", date: 'Thu Jul 07' }
};

// Pseudo Users Database
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


app.get('/',(req,res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (req.session.user_id in users) {
    res.render("urls_new", templateVars);
  } else {
    res.status(400).send("<div style='text-align:center; display:flex; justify-content:center; align-items:center; flex-direction:column; padding:3em 12em;'><h2>Sorry bub, only logged in users can shorten urls.. feel free to login if you are one!</h2><a href='/login' style='font-size:1em; display:inline; background:navy; color:#ffffff; width:8em; text-decoration:none; font-family:sans-serif; text-transform:uppercase; padding:10px 20px; text-align:center; border-radius:8px;'>Login here</a></div>");
  }
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render('register', templateVars);
  }
});

app.post('/register',(req,res) => {
  let userID = generateRandomString();
  const email = req.body.email;
  const pass = req.body.password;
  const hashedPassword = bcrypt.hashSync(pass, 10);
  if (getUserByEmail(email, users)) {
    res.status(400).send("<div style='text-align:center; display:flex; justify-content:center; align-items:center; flex-direction:column; padding:3em 12em;'><h2>Username already exists!</h2><a href='/login' style='font-size:1em; display:inline; background:navy; color:#ffffff; width:8em; text-decoration:none; font-family:sans-serif; text-transform:uppercase; padding:10px 20px; text-align:center; border-radius:8px;'>Login Instead</a></div>");
  } else if (!email || !pass) {
    res.status(400).send("<div style='text-align:center; display:flex; justify-content:center; align-items:center; flex-direction:column; padding:3em 12em;'><h2>Invalid username or password</h2><a href='/register' style='font-size:1em; display:inline; background:navy; color:#ffffff; width:8em; text-decoration:none; font-family:sans-serif; text-transform:uppercase; padding:10px 20px; text-align:center; border-radius:8px;'>Try Again</a></div>");
  } else {
    users[userID] = { id: userID, email: email, password: hashedPassword };
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

app.post('/urls',(req,res) => {
  let uID = generateRandomString();
  urlDatabase[uID] = { longURL: req.body.longURL, userID: req.session.user_id, date: newDateFunc() };
  res.redirect(`/urls/${uID}`);
});

app.post('/urls/:id/delete',(req,res) => {
  const usrID = req.session['user_id'];
  if (usrID === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.status(400).send("<div style='text-align:center; display:flex; justify-content:center; align-items:center; flex-direction:column; padding:3em 12em;'><h2>You don't have permission.... Return to your own urls</h2><a href='/urls' style='font-size:1em; display:inline; background:navy; color:#ffffff; width:8em; text-decoration:none; font-family:sans-serif; text-transform:uppercase; padding:10px 20px; text-align:center; border-radius:8px;'>Click Here</a></div>");
  }
});

app.post('/login', (req,res) => {
  const userEmail = req.body.user_email;
  const userPass = req.body.user_pass;
  for (const user in users) {
    if (!getUserByEmail(userEmail, users)) {
      res.status(403).send("<div style='text-align:center; display:flex; justify-content:center; align-items:center; flex-direction:column; padding:3em 12em;'><h2>Hmm.. that username didn't work..</h2><a href='/login' style='font-size:1em; display:inline; background:navy; color:#ffffff; width:8em; text-decoration:none; font-family:sans-serif; text-transform:uppercase; padding:10px 20px; text-align:center; border-radius:8px;'>Try Again</a></div>");
    } else if (users[user].email === userEmail && !bcrypt.compareSync(userPass, users[user].password)) {
      res.status(403).send("<div style='text-align:center; display:flex; justify-content:center; align-items:center; flex-direction:column; padding:3em 12em;'><h2>Hmm.. that password didn't work..</h2><a href='/login' style='font-size:1em; display:inline; background:navy; color:#ffffff; width:8em; text-decoration:none; font-family:sans-serif; text-transform:uppercase; padding:10px 20px; text-align:center; border-radius:8px;'>Try Again</a></div>");
    } else if (users[user].email === userEmail && bcrypt.compareSync(userPass, users[user].password)) {
      req.session.user_id = users[user].id;
      res.redirect('/urls');
    }
  }
});

app.get('/login',(req,res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render('login',templateVars);
  }
});

app.post('/logout',(req,res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get('/urls.json',(req,res) => {
  res.json(urlDatabase);
});

app.get('/urls',(req,res) => {
  const links = urlsForUser(req.session.user_id, urlDatabase);
  if (req.session.user_id) {
    res.render('urls_index',{ urlDatabase, user: users[req.session.user_id], links });
  } else {
    res.render('urls_index_blank',{ urlDatabase, user: users[req.session.user_id] });
  }

});

app.get('/urls/:id',(req,res) => {
  if (!req.session.user_id) {
    res.status(400).send("<div style='text-align:center; display:flex; justify-content:center; align-items:center; flex-direction:column; padding:3em 12em;'><h2>Please login</h2><a href='/login' style='font-size:1em; display:inline; background:navy; color:#ffffff; width:8em; text-decoration:none; font-family:sans-serif; text-transform:uppercase; padding:10px 20px; text-align:center; border-radius:8px;'>Login here</a></div>");
  }  
  const shortURL = req.params.id;
  if (!(shortURL in urlDatabase)) {
    res.status(400).send("<div style='text-align:center; display:flex; justify-content:center; align-items:center; flex-direction:column; padding:3em 12em;'><h2>Can't find URL, please go back</h2><a href='/urls' style='font-size:1em; display:inline; background:navy; color:#ffffff; width:8em; text-decoration:none; font-family:sans-serif; text-transform:uppercase; padding:10px 20px; text-align:center; border-radius:8px;'>Click Here</a></div>");
  } 
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id],
    date: urlDatabase[req.params.id].date
  };
  if (users[req.session.user_id].id === urlDatabase[shortURL].userID) {
    res.render('urls_show', templateVars);
  } else if (!req.session) {
    res.status(400).send("<div style='text-align:center; display:flex; justify-content:center; align-items:center; flex-direction:column; padding:3em 12em;'><h2>Must be signed in.. </h2><a href='/login' style='font-size:1em; display:inline; background:navy; color:#ffffff; width:8em; text-decoration:none; font-family:sans-serif; text-transform:uppercase; padding:10px 20px; text-align:center; border-radius:8px;'>Login Here</a></div>");
  } else {
    res.status(400).send("<div style='text-align:center; display:flex; justify-content:center; align-items:center; flex-direction:column; padding:3em 12em;'><h2>Unauthorized, please return to your own URLS page.. </h2><a href='/urls' style='font-size:1em; display:inline; background:navy; color:#ffffff; width:8em; text-decoration:none; font-family:sans-serif; text-transform:uppercase; padding:10px 20px; text-align:center; border-radius:8px;'>Click Here</a></div>");
  }
});

app.post('/urls/:id/update',(req,res) => {
  const usrID = req.session.user_id;
  if (usrID === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.status(400).send("<div style='text-align:center; display:flex; justify-content:center; align-items:center; flex-direction:column; padding:3em 12em;'><h2>You don't have permission.... Return to your own urls</h2><a href='/urls' style='font-size:1em; display:inline; background:navy; color:#ffffff; width:8em; text-decoration:none; font-family:sans-serif; text-transform:uppercase; padding:10px 20px; text-align:center; border-radius:8px;'>Click Here</a></div>");
  }
});

app.get('/u/:id',(req,res) => {
  const shortURL = req.params.id;
  if (!(shortURL in urlDatabase)) {
    res.status(400).send("<div style='text-align:center; display:flex; justify-content:center; align-items:center; flex-direction:column; padding:3em 12em;'><h2>Can't find URL, please go back</h2><a href='/urls' style='font-size:1em; display:inline; background:navy; color:#ffffff; width:8em; text-decoration:none; font-family:sans-serif; text-transform:uppercase; padding:10px 20px; text-align:center; border-radius:8px;'>Click Here</a></div>");
  } else {
    res.redirect(urlDatabase[req.params.id].longURL);
  }
});


app.listen(PORT,() => {
  console.log(`Tinyapp listening on http://localhost:${PORT}`);
});