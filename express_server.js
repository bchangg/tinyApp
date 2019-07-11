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
  response.redirect("login");
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/urls", (request, response) => {
  console.log(users);
  let userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === request.cookies["user_id"]) {
      userURLs[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  let templateVars = {
    urls: userURLs,
    user: users[request.cookies["user_id"]]
  }
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  let templateVars = {
    user: users[request.cookies["user_id"]]
  }
  if (!users[request.cookies["user_id"]]) {
    response.render("login", templateVars);
  } else {
    response.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (request, response) => {
  let templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL].longURL,
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
  urlDatabase[shortened] = {
    longURL: request.body.longURL,
    userID: users[request.cookies["user_id"]].id
  }
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
  if (!emailExists(request.body.email, users)) {
    response.status(403).send("Email has not been registered");
  } else if (emailExists(request.body.email, users)) {
    if (users[emailExists(request.body.email, users)].password === request.body.password) {
      response.cookie("user_id", emailExists(request.body.email, users));
      response.redirect("/urls");
    }
    response.status(403).send("Password does not match what is stored");
  }
});

app.post("/logout", (request, response) => {
  response.clearCookie("user_id", emailExists(request.body.email, users));
  response.redirect("/urls");
});

app.post("/register", (request, response) => {
  if (request.body.email === "" || request.body.password === "") {
    response.status(400).render("Email or password string is empty");
  } else if (emailExists(request.body.email, users)) {
    response.status(400).send("Email is already in the database");
  } else {
    const userRegisterRandomString = random6CharString();
    users[userRegisterRandomString] = {
      id: userRegisterRandomString,
      email: request.body.email,
      password: request.body.password
    };
    response.cookie("user_id", userRegisterRandomString);
    response.redirect("/urls");
  }
});

// NOTE: SERVER 'START'
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});