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

// OPENAI related stuff
const http = require("http").Server(app);
const io = require("socket.io")(http);
app.use(express.json());
const { Configuration, OpenAIApi } = require("openai");
const config = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});

const openai = new OpenAIApi(config);
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("chat message", async (msg) => {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: msg,
      temperature: 1,
      max_tokens: 500,
    });
    io.emit("chat message", response.data.choices[0].text);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Changed to 24 hours for testing purposes so that we don't have to keep logging in
// Session Expiry time set to 1 hour
const expireTime = 24 * 60 * 60 * 1000;

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
const foodCollection = database
  .db(mongodb_database)
  .collection("fastfoodnutrition");

// Navbar links
const url = require("url");
const navLinks = [
  { name: "Home", link: "/home", file: "icon-home" },
  { name: "Menu", link: "/restaurant", file: "icon-menu" },
  { name: "Chat", link: "/chat", file: "icon-chatbot" },
];

// Middleware for navbar links
app.use("/", (req, res, next) => {
  app.locals.navLinks = navLinks;
  app.locals.currentURL = url.parse(req.url, false, false).pathname;
  app.locals.searchList = searchList;
  next();
});

var searchList = [];
async function createSearchArray() {
  var searchResults = await foodCollection
    .find()
    .sort()
    .project({
      restaurant: 1,
      item: 1,
      calories: 1,
      total_fat: 1,
      total_carb: 1,
      protein: 1,
    })
    .toArray();
  searchList = searchResults;
}
createSearchArray();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

const goalCalculation = require("./public/js/goalCalculation.js");

app.use(express.static("app"));
app.use("/img", express.static("./public/images"));
app.use("/css", express.static("./public/css"));
app.use("/js", express.static("./public/js"));

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
    res.render("home", { name: req.session.name });
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
    return res.status(400).json({ error: "Username is required" });
  }
  if (!firstName) {
    return res.status(400).json({ error: "First Name is required" });
  }
  if (!lastName) {
    return res.status(400).json({ error: "Last Name is required" });
  }
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  if (!birthday) {
    return res.status(400).json({ error: "Birthday is required" });
  }
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  // GPT_Promt_2

  // Check if username or email already exists in the database
  const existingUser = await userCollection.findOne({
    username: username,
  });
  const existingEmail = await userCollection.findOne({
    email: email,
  });

  if (existingUser) {
    // Render an error message indicating that the username or email is already taken
    return res.status(400).json({ error: "Username is already taken" });
  }
  if (existingEmail) {
    // Render an error message indicating that the username or email is already taken
    return res.status(400).json({ error: "Email already exists" });
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
    res.json({ redirect: "/signup" });
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
  req.session.cookie.maxAge = expireTime;
  res.json({ redirect: "/security_questions" });
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
  const calorieNeeds = goalCalculation.calculateCalorieNeeds(
    sex,
    birthday,
    height,
    weight,
    activity,
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
    res.status(400).json({ error: "Please enter a valid username" });
    return;
  }

  const result = await userCollection
    .find({ username: username })
    .project({ username: 1, password: 1, user_type: 1, _id: 1, firstName: 1 })
    .toArray();

  console.log(result);

  if (result.length != 1) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  if (await bcrypt.compare(password, result[0].password)) {
    console.log("correct password");
    req.session.authenticated = true;
    req.session.username = result[0].username;
    req.session.firstName = result[0].firstName;
    req.session.user_type = result[0].user_type;
    req.session.cookie.maxAge = expireTime;
    res.json({ redirect: "/home" });
    return;
  } else {
    console.log("incorrect password");
    res.status(400).json({ error: "Incorrect password" });
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

//Find Username Section
app.get("/find_username", (req, res) => {
  res.render("find_username");
});

app.post("/username_search", async (req, res) => {
  var email = req.body.email;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var birthday = req.body.birthday;

  const schema = Joi.object({
    email: Joi.string().max(30).required(),
    firstName: Joi.string().max(20).required().allow(" "),
    lastName: Joi.string().max(20).required().allow(" "),
    email: Joi.string().max(30).required(),
    birthday: Joi.string()
      .regex(/^(\d{4})-(\d{2})-(\d{2})$/)
      .required(),
  });

  const validationResult = schema.validate({
    email,
    firstName,
    lastName,
    birthday,
  });
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect("/find_username");
    return;
  }

  const result = await userCollection
    .find({
      email: email,
      firstName: firstName,
      lastName: lastName,
      birthday: birthday,
    })
    .project({
      email: 1,
      email: 1,
      firstName: 1,
      lastName: 1,
      birthday: 1,
      username: 1,
    })
    .toArray();
  if (result.length != 1) {
    res.render("find_ID_error", { error: "User not found." });
    return;
  } else {
    res.render("username_search", { result: result });
    return;
  }
});

app.get("/username_search", (req, res) => {
  res.render("username_search");
});

app.get("/home", async (req, res) => {
  var username = req.session.username;
  const result = await userCollection
    .find({ username: username })
    .project({
      firstName: 1,
      calorieNeeds: 1,
      protein: 1,
      carbs: 1,
      fat: 1,
    })
    .toArray();
  if (!req.session.authenticated) {
    res.redirect("/");
  } else {
    res.render("home", {
      name: result[0].firstName,
      calorie_goal: result[0].calorieNeeds,
      carbs_goal: result[0].carbs,
      protein_goal: result[0].protein,
      fat_goal: result[0].fat,
      //current values are placeholders, to be replaced with actual ones
      current_calorie: 200,
      current_carbs: 30,
      current_protein: 30,
      current_fat: 25,
    });
  }
});

app.get("/profile", async (req, res) => {
  if (!req.session.authenticated) {
    res.redirect("/");
  } else {
    var username = req.session.username;
    const result = await userCollection
      .find({ username: username })
      .project({
        firstName: 1,
        lastName: 1,
        sex: 1,
        birthday: 1,
        height: 1,
        weight: 1,
        activity: 1,
        goal: 1,
        calorieNeeds: 1,
        protein: 1,
        carbs: 1,
        fat: 1,
      })
      .toArray();
    res.render("profile", {
      firstName: result[0].firstName,
      lastName: result[0].lastName,
      sex: result[0].sex,
      birthday: result[0].birthday,
      height: result[0].height,
      weight: result[0].weight,
      activity: result[0].activity,
      goal: result[0].goal,
      calorieNeeds: result[0].calorieNeeds,
      protein: result[0].protein,
      carbs: result[0].carbs,
      fat: result[0].fat,
    });
  }
});

app.post("/update_profile", async (req, res) => {
  const { firstName, lastName, sex, birthday, height, weight, activity, goal } =
    req.body;
  const calorieNeeds = goalCalculation.calculateCalorieNeeds(
    sex,
    birthday,
    height,
    weight,
    activity,
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
        firstName: firstName,
        lastName: lastName,
        sex: sex,
        birthday: birthday,
        height: height,
        weight: weight,
        activity: activity,
        goal: goal,
        calorieNeeds: calorieNeeds,
        protein: protein,
        fat: fat,
        carbs: carbs,
      },
    },
    (err, result) => {
      if (err) {
        console.error(err);
      }
    }
  );
  res.json({ message: "Profile updated" });
});

// insert restaurants into the database
async function insertRestaurants() {
  try {
    const restaurantCollection = database
      .db(mongodb_database)
      .collection("restaurants");

    const restaurants = [
      {
        name: "McDonalds",
        image: "/images/Mcdonalds1.png",
      },
      {
        name: "Burger King",
        image: "/images/BurgerKing1.png",
      },
      {
        name: "Subway",
        image: "/images/Subway1.png",
      },
      {
        name: "Taco Bell",
        image: "/images/TacoBell1.png",
      },
      {
        name: "Arbys",
        image: "/images/Arbys1.png",
      },
      {
        name: "KFC",
        image: "/images/KFC1.png",
      },
    ];

    const result = await restaurantCollection.insertMany(restaurants);
    console.log(`${result.insertedCount} restaurants inserted`);
  } catch (error) {
    console.error(error);
  }
}

app.get("/restaurant", async (req, res) => {
  const restaurantCollection = database
    .db(mongodb_database)
    .collection("restaurants");
  const restaurants = await restaurantCollection.find().toArray();

  res.render("restaurant", { restaurants });
});

app.get("/menu/:restaurantName", async (req, res) => {
  try {
    const restaurantName = req.params.restaurantName;
    const restaurantCollection = database
      .db(mongodb_database)
      .collection("restaurants");
    const menuCollection = database
      .db(mongodb_database)
      .collection("fastfoodnutrition");

    const [restaurant, menu] = await Promise.all([
      restaurantCollection.findOne({ name: restaurantName }),
      menuCollection.find({ restaurant: restaurantName }).toArray(),
    ]);

    console.log(restaurant),
      console.log(menu),
      res.render("menu", { restaurant, menu });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/filter", async (req, res) => {
  const checkedFilters = Array.isArray(req.query.filter)
    ? req.query.filter
    : req.query.filter.split(",");
  const searchListCopy = app.locals.searchList.slice();

  const filteredList = searchListCopy.filter((item) => {
    for (const filter of checkedFilters) {
      switch (filter) {
        case "calorie":
          if (item.calories >= 400) {
            return false;
          }
          break;
        case "protein":
          if (item.protein * 4 <= item.calories * 0.3) {
            return false;
          }
          break;
        case "fat":
          if (item.total_fat * 9 >= item.calories * 0.2) {
            return false;
          }
          break;
        case "carb":
          if (item.total_carb * 4 >= item.calories * 0.26) {
            return false;
          }
          break;
      }
    }
    return true;
  });

  // render the page with the filteredList
  res.render("filtered-page", {
    filteredList,
  });
});
// Testing navbar icons
app.get("/chat", (req, res) => {
  res.render("chat");
});

app.get("/item/:restaurant/:item", async (req, res) => {
  var restaurant = req.params.restaurant;
  var item = req.params.item;
  var username = req.session.username;
  const goals = await userCollection
    .find({ username: username })
    .project({
      calorieNeeds: 1,
      protein: 1,
      carbs: 1,
      fat: 1,
    })
    .toArray();

  const itemDetails = await foodCollection
    .find({ restaurant: restaurant, item: item })
    .project({
      calories: 1,
      cal_fat: 1,
      total_fat: 1,
      sat_fat: 1,
      trans_fat: 1,
      cholesterol: 1,
      sodium: 1,
      total_carb: 1,
      fiber: 1,
      sugar: 1,
      protein: 1,
      vit_a: 1,
      vit_c: 1,
      calcium: 1,
    })
    .toArray();

  res.render("item", {
    restaurant: restaurant,
    item: item,
    calories: itemDetails[0].calories,
    cal_fat: itemDetails[0].cal_fat,
    total_fat: itemDetails[0].total_fat,
    sat_fat: itemDetails[0].sat_fat,
    trans_fat: itemDetails[0].trans_fat,
    cholesterol: itemDetails[0].cholesterol,
    sodium: itemDetails[0].sodium,
    total_carb: itemDetails[0].total_carb,
    fiber: itemDetails[0].fiber,
    sugar: itemDetails[0].sugar,
    protein: itemDetails[0].protein,
    vit_a: itemDetails[0].vit_a,
    vit_c: itemDetails[0].vit_c,
    calcium: itemDetails[0].calcium,
    calorie_goal: goals[0].calorieNeeds,
    carbs_goal: goals[0].carbs,
    protein_goal: goals[0].protein,
    fat_goal: goals[0].fat,
  });
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

http.listen(port, () => {
  console.log("Node application listening on port " + port);
});
