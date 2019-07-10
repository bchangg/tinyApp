const { users } = require("./database/database");
const { urlDatabase } = require("./database/database");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

// Sampled from:
// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const shortenedURL = function generateRandomString() {
  let result = "";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * length));
  }
  return result;
}

// NOTE: SERVER SETTINGS
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// NOTE: GET REQUESTS
app.get("/", (request, response) => {
  response.send("Hello!");
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/urls", (request, response) => {
  let templateVars = {
    urls: urlDatabase,
    username: request.cookies["username"]
  }
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  let templateVars = {
    username: request.cookies["username"]
  }
  response.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (request, response) => {
  let templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL],
    username: request.cookies["username"]
  };
  response.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  response.redirect(`${urlDatabase[request.params.shortURL]}`);
});

app.get("/register", (request, response) => {
  let templateVars = {
    username: request.cookies["username"]
  };
  response.render("register_user", templateVars);
});

// NOTE: POST REQUESTS
app.post("/urls", (request, response) => {
  if ((request.body.longURL).substr(0, 7) !== 'http://') {
    request.body.longURL = 'http://' + request.body.longURL;
  } else if ((request.body.longURL).substr(0, 11) !== 'http://www.') {
    request.body.longURL = 'http://www.' + request.body.longURL;
  }
  const shortened = shortenedURL();
  urlDatabase[shortened] = request.body.longURL;
  response.redirect(`/urls/${shortened}`);
});

app.post("/urls/:shortURL", (request, response) => {
  urlDatabase[request.params.shortURL] = request.body.editLongURL;
  response.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (request, response) => {
  delete urlDatabase[request.params.shortURL];
  response.redirect("/urls");
});

app.post("/login", (request, response) => {
  response.cookie("username", request.body.username);
  response.redirect("/urls");
});

app.post("/logout", (request, response) => {
  response.clearCookie("username", request.body.username);
  response.redirect("/urls");
});

// COMBAK: FIX THIS POST FUNCTION SO THAT IT STORES STUFF INTO THE USERS "DATABASE" OBJECT
app.post("/register", (request, response) => {
  users[request.body.email] = {};
  response.end("Success");
});

// NOTE: SERVER 'START'
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});