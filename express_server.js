const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

// NOTE: GET REQUESTS
app.get("/", (req, resp) => {
  resp.send("Hello!");
});

app.get("/urls.json", (req, resp) => {
  resp.json(urlDatabase);
});

app.get("/hello", (req, resp) => {
  resp.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, resp) => {
  let templateVars = { urls: urlDatabase }
  resp.render("urls_index", templateVars);
});

app.get("/urls/new", (req, resp) => {
  resp.render("urls_new");
});

app.get("/urls/:shortURL", (req, resp) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  resp.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, resp) => {
  let destination = urlDatabase[req.params.shortURL];
  resp.redirect(`${destination}`);
});

// NOTE: POST REQUESTS
app.post("/urls", (req, resp) => {
  const shortened = shortenedURL();
  if((req.body.longURL).substr(0, 7) !== 'http://') {
    req.body.longURL = 'http://' + req.body.longURL;
  }
  urlDatabase[shortened] = req.body.longURL;
  resp.redirect(`/urls/${shortened}`);
});

app.post("/urls/:shortURL/delete", (req, resp) => {
  delete urlDatabase[req.params.shortURL];
  resp.redirect("/urls");
});

// NOTE: SERVER 'START'
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});