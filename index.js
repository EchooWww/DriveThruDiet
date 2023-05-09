require("./utils.js");

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const port = process.env.PORT || 3030;
const app = express();
const Joi = require("joi");
const cors = require("cors");

// Changed to 24 hours for testing purposes so that we don't have to keep logging in
// Session Expiry time set to 1 hour
const expireTime = 24 * 60 * 60 * 1000;

const goalCalculation = require("./goalCalculation.js");

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

var { database } = include("databaseConnection");

const userCollection = database.db(mongodb_database).collection("users");

// Navbar links
const url = require("url");
const navLinks = [
  { name: "Home", link: "/home", file: "icon-home" },
  { name: "Menu", link: "/menu", file: "icon-menu" },
  { name: "Chat", link: "/chat", file: "icon-chatbot" },
];

// Middleware for navbar links
app.use("/", (req, res, next) => {
  app.locals.navLinks = navLinks;
  app.locals.currentURL = url.parse(req.url, false, false).pathname;
  next();
});

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

app.use("/img", express.static("./public/images"));
app.use("/css", express.static("./public/css"));

var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

app.use(
  session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store
    saveUninitialized: false,
    resave: true,
  })
);

app.get("/", (req, res) => {
  var name = req.query.user;
  if (!req.session.authenticated) {
    res.render("index_before_login");
    return;
  } else {
    res.render("index_after_login", { name: req.session.name });
  }
});

//New User Creation
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/submitUser", async (req, res) => {
  var username = req.body.username;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var email = req.body.email;
  var birthday = req.body.birthday;
  var password = req.body.password;
  if (!username) {
    res.render("signup_error", { error: "Username" });
  }
  if (!firstName) {
    res.render("signup_error", { error: "First Name" });
  }
  if (!lastName) {
    res.render("signup_error", { error: "Last Name" });
  }
  if (!email) {
    res.render("signup_error", { error: "Email" });
  }
  if (!birthday) {
    res.render("signup_error", { error: "Birthday" });
  }
  if (!password) {
    res.render("signup_error", { error: "Password" });
  }
  const schema = Joi.object({
    username: Joi.string().alphanum().max(20).required(),
    firstName: Joi.string().max(20).required().allow(" "),
    lastName: Joi.string().max(20).required().allow(" "),
    email: Joi.string().max(30).required(),
    birthday: Joi.string()
      .regex(/^(\d{4})-(\d{2})-(\d{2})$/)
      .required(),
    password: Joi.string().max(20).required(),
  });

  const validationResult = schema.validate({
    username,
    firstName,
    lastName,
    email,
    birthday,
    password,
  });
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect("/signup");
    return;
  }
  var hashedPassword = await bcrypt.hash(password, saltRounds);
  await userCollection.insertOne({
    username: username,
    firstName: firstName,
    lastName: lastName,
    email: email,
    birthday: birthday,
    password: hashedPassword,
    user_type: "user",
  });
  console.log("User Created");
  req.session.authenticated = true;
  req.session.username = username;
  req.session.firstName = firstName;
  req.session.cookie.maxAge = expireTime;
  res.redirect("/security_questions");
  return;
});

//Set Security Questions
app.get("/security_questions", (req, res) => {
  res.render("security_questions");
});

app.post("/security_answers", async (req, res) => {
  const { question1, question2, question3 } = req.body;

  const questions = [
    {
      question: "What is your mother's maiden name?",
      answer: question1,
    },
    {
      question: "What was the name of your first pet?",
      answer: question2,
    },
    {
      question: "What is your favorite color?",
      answer: question3,
    },
  ];

  await userCollection.updateOne(
    { username: req.session.username },
    {
      $set: {
        questions: questions,
      },
    },
    (err, result) => {
      if (err) {
        console.error(err);
      }
    }
  );
  res.redirect("/signup_profile");
  return;
});

//Set Profile Preference
app.get("/signup_profile", (req, res) => {
  res.render("signup_profile");
});

app.post("/onboarding_goal", async (req, res) => {
  const { sex, height, weight, activity, goal } = req.body;
  const user = await userCollection.findOne({ username: req.session.username });
  const birthday = user.birthday;
  const BMR = goalCalculation.calculateBMR(sex, weight, height, birthday);
  const calorieNeeds = goalCalculation.calculateCalorieNeeds(
    activity,
    BMR,
    goal
  );
  const { protein, fat, carbs } = goalCalculation.calculateMacronutrients(
    weight,
    calorieNeeds,
    goal
  );

  await userCollection.updateOne(
    { username: req.session.username },
    {
      $set: {
        sex,
        height,
        weight,
        activity,
        goal,
        calorieNeeds,
        protein,
        fat,
        carbs,
      },
    },
    (err, result) => {
      if (err) {
        console.error(err);
      }
    }
  );

  res.render("onboarding_goal", {
    calorieNeeds,
    protein,
    fat,
    carbs,
  });
});

//Login Validation
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/loggingIn", async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  const schema = Joi.string().alphanum().max(20).required();
  const validationResult = schema.validate(username);
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.render("login_error", { error: "Please enter a valid username" });
    return;
  }

  const result = await userCollection
    .find({ username: username })
    .project({
      username: 1,
      username: 1,
      password: 1,
      user_type: 1,
      _id: 1,
      firstName: 1,
    })
    .toArray();
  console.log(result);
  if (result.length != 1) {
    res.render("login_error", { error: "User not found." });
    return;
  }
  if (await bcrypt.compare(password, result[0].password)) {
    console.log("correct password");
    req.session.authenticated = true;
    req.session.username = result[0].username;
    req.session.firstName = result[0].firstName;
    req.session.user_type = result[0].user_type;
    req.session.cookie.maxAge = expireTime;
    res.redirect("/home");
    return;
  } else {
    console.log("incorrect password");
    res.render("login_error", { error: "Incorrect password" });
    return;
  }
});

//Reset Password Section
app.get("/forgot", (req, res) => {
  const questions = [
    { question: "What is your mother's maiden name?" },
    { question: "What was the name of your first pet?" },
    { question: "What is your favorite color?" },
  ];
  res.render("forgot", { questions });
});

app.post("/reset_password", async (req, res) => {
  const { username, answer, questionIndex } = req.body;
  const newPassword = req.body.password;

  const user = await userCollection.findOne({ username: username });
  if (!user) {
    res.send(
      '<script>alert("User not found"); window.location.href = "/forgot";</script>'
    );
    return;
  }

  const question = user.questions[questionIndex];
  if (question.answer !== answer) {
    res.send(
      '<script>alert("Incorrect answer"); window.location.href = "/forgot";</script>'
    );
    return;
  }

  const schema = Joi.object({
    newPassword: Joi.string().max(20).required(),
  });

  const validationResult = schema.validate({
    newPassword,
  });
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect("/forgot");
    return;
  }

  var hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  await userCollection.updateOne(
    { username: username },
    { $set: { password: hashedPassword } }
  );

  res.redirect("/update");
});

app.get("/update", (req, res) => {
  res.render("update");
});

app.get("/home", (req, res) => {
  if (!req.session.authenticated) {
    res.redirect("/");
  } else {
    res.render("home", { name: req.session.firstName });
  }
});

// Testing navbar icons
app.get("/menu", (req, res) => {
  res.render("menu");
});
// Testing navbar icons
app.get("/chat", (req, res) => {
  res.render("chat");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.use(express.static(__dirname + "/public"));

app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

app.listen(port, () => {
  console.log("Node application listening on port " + port);
});
