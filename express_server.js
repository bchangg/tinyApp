// NOTE: CONST VARIABLES AND FUNCTIONS IMPORTED FROM ELSEWHERE
const { users } = require("./database/database");
const { urlDatabase } = require("./database/database");
const { randomString } = require("./database/helperFunctions");
const { findUser } = require("./database/helperFunctions");

// NOTE: MIDDLEWARE
const bcrypt = require("bcrypt");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');


// NOTE: SERVER SETTINGS
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: "user_id",
  keys: ['secret1', 'secret2'],
}));

// NOTE: GET REQUESTS
app.get("/", (request, response) => {
  response.redirect("login");
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/urls", (request, response) => {
  let userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === request.session.user_id) {
      userURLs[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  let templateVars = {
    urls: userURLs,
    user: users[request.session.user_id]
  };
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  let templateVars = {
    user: users[request.session.user_id]
  };
  if (!users[request.session.user_id]) {
    response.render("login", templateVars);
  } else {
    response.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (request, response) => {
  let templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL].longURL,
    user: users[request.session.user_id]
  };
  response.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  console.log(urlDatabase);
  response.redirect(`${urlDatabase[request.params.shortURL].longURL}`);
});

app.get("/register", (request, response) => {
  let templateVars = {
    user: users[request.session.user_id]
  };
  response.render("register_user", templateVars);
});

app.get("/login", (request, response) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[request.session.user_id]
  };
  response.render("login", templateVars);
});

// NOTE: POST REQUESTS
app.post("/urls", (request, response) => {
  let longURL = request.body.longURL;
  
  // BUG: http://www.google.com turns into http://www.www.google.com
  
  if (longURL.substring(0, 6) !== 'http://' && longURL.substring(0, 4) !== 'www.') {
    if(longURL.substring(0, 10) !== 'http://www.')
    longURL = 'http://www.' + longURL;
  } else if (longURL.substring(0, 6) !== 'http://' && longURL.substring(0, 4) === 'www.') {
    longURL = 'http://' + longURL;
  }

  const shortened = randomString(6);
  urlDatabase[shortened] = {
    longURL: longURL,
    userID: users[request.session.user_id].id
  };
  response.redirect(`/urls/${shortened}`);
});

app.post("/urls/:shortURL", (request, response) => {
  urlDatabase[request.params.shortURL].longURL = request.body.editLongURL;
  response.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (request, response) => {
  delete urlDatabase[request.params.shortURL];
  response.redirect("/urls");
});

app.post("/login", (request, response) => {
  const userEmail = request.body.email;
  const userPassword = request.body.password;
  const currentUser = findUser(userEmail, users);
  if (!currentUser) {
    response.status(403).send("Email has not been registered");
  } else if (currentUser) {
    if (!bcrypt.compareSync(userPassword, users[currentUser].password)) {
      response.status(403).send("Password does not match what is stored");
    }
    request.session.user_id = currentUser;
    response.redirect("/urls");
  }
});

app.post("/logout", (request, response) => {
  const userEmail = request.body.email;
  const currentUser = findUser(userEmail, users);
  request.session = null;
  response.redirect("/urls");
});

app.post("/register", (request, response) => {
  const userEmail = request.body.email;
  const userPassword = request.body.password;

  if (!userEmail || !userPassword) {
    response.status(400).send("Email or password string is empty");
  } else if (findUser(userEmail, users)) {
    response.status(400).send("Email has already been registered.");
  } else {
    const userRegisterRandomString = randomString(12);
    users[userRegisterRandomString] = {
      id: userRegisterRandomString,
      email: request.body.email,
      password: bcrypt.hashSync(userPassword, 10)
    };
    request.session.user_id = userRegisterRandomString;
    response.redirect("/urls");
  }
});

// NOTE: SERVER 'START'
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});