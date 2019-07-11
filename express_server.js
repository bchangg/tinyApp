const { users } = require("./database/database");
const { urlDatabase } = require("./database/database");
const { random6CharString } = require("./database/helperFunctions");
const { emailExists } = require("./database/helperFunctions");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

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
    user: users[request.cookies["user_id"]]
  }
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  let templateVars = {
    user: users[request.cookies["user_id"]]
  }
  response.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (request, response) => {
  let templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL],
    user: users[request.cookies["user_id"]]
  };
  response.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  response.redirect(`${urlDatabase[request.params.shortURL]}`);
});

app.get("/register", (request, response) => {
  let templateVars = {
    user: users[request.cookies["user_id"]]
  };
  response.render("register_user", templateVars);
});

app.get("/login", (request, response) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[request.cookies["user_id"]]
  }
  response.render("login", templateVars);
})

// NOTE: POST REQUESTS
app.post("/urls", (request, response) => {
  if ((request.body.longURL).substr(0, 7) !== 'http://') {
    request.body.longURL = 'http://' + request.body.longURL;
  } else if ((request.body.longURL).substr(0, 11) !== 'http://www.') {
    request.body.longURL = 'http://www.' + request.body.longURL;
  }
  const shortened = random6CharString();
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
  console.log("entered login");
  if (!emailExists(request.body.email, users)) {
    response.status(403).render("error");
  } else if (emailExists(request.body.email, users)) {
    if (users[emailExists(request.body.email, users)].password !== request.body.password) {
      response.status(403).render("error");
    }
    response.cookie("user_id", emailExists(request.body.email, users));
    response.redirect("/urls");
  } 
});

app.post("/logout", (request, response) => {
  console.log(users);
  response.clearCookie("user_id", emailExists(request.body.email, users));
  response.redirect("/urls");
});

app.post("/register", (request, response) => {
  if (request.body.email === "" || request.body.password === "") {
    response.status(400).render("error");
  } else if (emailExists(request.body.email, users)) {
    response.status(400).render("error");
  } else {
    const userRegisterRandomString = random6CharString();
    users[userRegisterRandomString] = {};
    users[userRegisterRandomString].id = userRegisterRandomString;
    users[userRegisterRandomString].email = request.body.email;
    users[userRegisterRandomString].password = request.body.password;
    response.cookie("user_id", userRegisterRandomString);
    response.redirect("/urls");
  }
});

// NOTE: SERVER 'START'
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});