let passwordString = "";
if (!process.env.DATABASE_URL) {
  const { password } = require("./passwords");
  passwordString = password;
}
var express = require("express"); //Ensure our express framework has been added
var app = express();
var bodyParser = require("body-parser"); //Ensure our body-parser tool has been added
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const session = require("express-session");

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

//Create Database Connection
var pgp = require("pg-promise")();
let databaseConfig;
if (process.env.PORT) {
  databaseConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  };
  // ^^ this is used for heroku
} else {
  // vv this is used for local hosting
  databaseConfig = `postgresql://postgres:${passwordString}@localhost:5432/postgres`;
}
const db = pgp(databaseConfig);
module.exports.db = db;
/*
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${password}@localhost:5432/postgres`,
  ssl: process.env.DATABASE_URL ? true : false
});

client.connect();
*/
const bcrypt = require("bcrypt");

process.on("uncaughtException", function (err) {
  console.log(err);
});

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/")); //This line is necessary for us to use relative paths and access our resources directory

app.get("/", function (req, res) {
  res.render("pages/home", {
    local_css: "home.css",
    my_title: "Home Page",
    loggedin: req.session.loggedin,
    username: req.session.username,
  });
});

app.get("/blackjack", function (req, res) {
  if (req.session.loggedin) {
    var accountQuery = `SELECT balance FROM public.account WHERE user_id=${req.session.user_id};`;
    var userQuery = `SELECT * FROM public.users WHERE user_id=${req.session.user_id};`;
    db.task("/blackjack", (task) => {
      return task.batch([task.any(accountQuery), task.any(userQuery)]);
    })
      .then((data) => {
        res.render("pages/blackjack", {
          local_css: "blackjack.css",
          my_title: "Blackjack",
          data,
          loggedin: req.session.loggedin,
        });
      })
      .catch((err) => {
        console.log("error", err);
        res.render("pages/blackjack", {
          local_css: "blackjack.css",
          my_title: "Blackjack",
          data: "",
          loggedin: req.session.loggedin,
        });
      });
  } else {
    res.render("pages/home", {
      local_css: "home.css",
      my_title: "Home Page",
      loggedin: req.session.loggedin,
      username: req.session.username,
      error: "You need to log in first!",
    });
  }
});

app.get("/balance", function (req, res) {
  if (req.session.loggedin) {
    var accountQuery = `SELECT balance FROM public.account WHERE user_id=${req.session.user_id};`;
    db.task("/balance", (task) => {
      return task.batch([task.any(accountQuery)]);
    })
      .then((data) => {
        res.json({ balance: data[0][0].balance });
      })
      .catch((err) => {
        console.log("error", err);
      });
  } else {
    console.log("error");
  }
});

app.post("/blackjack/pay", function (req, res) {
  console.log(req.body);
  var amountBet = req.body.bet; // from game, amount bet
  var multiplier = req.body.multiplier; // from game, multiplier should be 0 if loss, 2 if win
  var amountWon = amountBet * multiplier;
  if (multiplier) {
    // win
    var winQuery1 = `UPDATE public.account SET balance = (balance + ${amountWon}) WHERE user_id=${req.session.user_id};`;
    var winQuery2 = `UPDATE public.account SET earnings = (earnings + ${amountWon}) WHERE user_id=${req.session.user_id};`;
    console.log("user with id " + req.session.user_id + " won " + amountWon);
    db.task("/blackjack/pay", (task) => {
      return task.batch([task.any(winQuery1), task.any(winQuery2)]);
    })
      .then((data) => {
        res.redirect("/blackjack");
      })
      .catch((err) => {
        console.log("error", err);
        res.redirect("/blackjack");
      });
  } else {
    // loss
    var lossQuery1 = `UPDATE public.account SET balance = (balance - ${amountBet}) WHERE user_id=${req.session.user_id};`;
    var lossQuery2 = `UPDATE public.account SET money_lost = (money_lost + ${amountBet}) WHERE user_id=${req.session.user_id};`;
    console.log("user with id" + req.session.user_id + " lost " + amountBet);
    db.task("/blackjack/pay", (task) => {
      return task.batch([task.any(lossQuery1), task.any(lossQuery2)]);
    })
      .then((data) => {
        res.redirect("/blackjack");
      })
      .catch((err) => {
        console.log("error", err);
        res.redirect("/blackjack");
      });
  }
});

app.get("/login", function (req, res) {
  if (req.session.loggedin) {
    res.render("pages/home", {
      local_css: "home.css",
      my_title: "Home Page",
      loggedin: req.session.loggedin,
      username: req.session.username,
      error: "You are already logged in",
    });
  } else {
    res.render("pages/login", {
      local_css: "login.css",
      my_title: "Login",
      loggedin: req.session.loggedin,
      username: req.session.username,
    });
  }
});

app.post("/login/auth", function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var query = `SELECT * FROM public.users WHERE email = '${email}';`;
  db.task("/login/auth", (task) => {
    return task.batch([task.any(query)]);
  })
    .then((data) => {
      if (data[0].length == 0) {
        res.render("pages/login", {
          local_css: "login.css",
          my_title: "Login",
          error: "Email was not found",
        });
      } else {
        let passwordMatches = false;
        bcrypt.compare(password, data[0][0].password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            req.session.loggedin = true;
            req.session.username = data[0][0].user_name;
            req.session.user_id = data[0][0].user_id;
            passwordMatches = true;
            res.redirect("/");
          } else {
            passwordMatches = false;
            res.render("pages/login", {
              local_css: "login.css",
              my_title: "Login",
              error: "Incorrect password",
            });
          }
        });
      }
    })
    .catch((err) => {
      console.log("error", err);
      res.render("pages/login", {
        local_css: "login.css",
        my_title: "Login",
        error: err,
      });
    });
});

app.post("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

app.get("/register", function (req, res) {
  if (req.session.loggedin) {
    res.render("pages/home", {
      local_css: "home.css",
      my_title: "Home Page",
      loggedin: req.session.loggedin,
      username: req.session.username,
      error: "You are already logged in",
    });
  } else {
    res.render("pages/register", {
      local_css: "register.css",
      my_title: "Register",
      loggedin: req.session.loggedin,
      username: req.session.username,
    });
  }
});

app.post("/register/register_user", async function (req, res) {
  var username = req.body.username;
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var rank = 1;
  var query = `SELECT user_id FROM public.users WHERE user_name='${username}' OR email='${email}';`;

  var alreadyExists = false;
  await db
    .task("/register/register_user", (task) => {
      return task.batch([task.any(query)]);
    })
    .then((data) => {
      if (data[0].length >= 1) {
        alreadyExists = true;
        res.render("pages/register", {
          local_css: "register.css",
          my_title: "Register",
          loggedin: req.session.loggedin,
          error: "A user with that username and/or email already exists!",
        });
      }
    })
    .catch((err) => {
      console.log("error", err);
      res.render("pages/register", {
        local_css: "register.css",
        my_title: "Register",
        loggedin: req.session.loggedin,
        error: err,
      });
    });

  if (alreadyExists) {
    return;
  }

  bcrypt.genSalt(10, (err, salt) =>
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;
      var user_insert_statement = `INSERT INTO public.users(name, user_name, email, password) VALUES('${name}', '${username}', '${email}', '${hash}');`;
      var leaderboard_insert_statement = `INSERT INTO public.leaderboard(name, user_name, rank) VALUES('${name}', '${username}', ${rank});`;
      var account_insert_statement = `INSERT INTO public.account(balance, earnings, deposited, money_lost) VALUES(0,0,0,0);`;
      db.task("/register/register_user", (task) => {
        return task.batch([task.any(user_insert_statement), task.any(leaderboard_insert_statement), task.any(account_insert_statement)]);
      })
        .then((data) => {
          res.redirect("/");
        })
        .catch((err) => {
          console.log("error", err);
          res.render("pages/register", {
            local_css: "register.css",
            my_title: "Register",
            loggedin: req.session.loggedin,
          });
        });
    })
  );
});

app.get("/leaderboard", function (req, res) {
  var leaderboardQuery = "SELECT name, user_name, user_id FROM public.leaderboard ORDER BY user_id;";
  var accountQuery = "SELECT earnings, user_id, rank () over (order by earnings desc) bal_rank FROM public.account ORDER BY user_id;";
  db.task("/leaderboard", (task) => {
    return task.batch([task.any(leaderboardQuery), task.any(accountQuery)]);
  })
    .then((data) => {
      res.render("pages/leaderboard", {
        local_css: "leaderboard.css",
        my_title: "Leaderboard",
        data,
        loggedin: req.session.loggedin,
      });
    })
    .catch((err) => {
      console.log("error", err);
      res.render("pages/leaderboard", {
        local_css: "leaderboard.css",
        my_title: "Leaderboard",
        data: "",
        loggedin: req.session.loggedin,
      });
    });
});

app.get("/account", (req, res) => {
  if (!req.session.loggedin) {
    res.render("pages/home", {
      local_css: "home.css",
      my_title: "Home Page",
      error: "You need to log in first!",
    });
    return;
  }
  var usersQuery = `SELECT name, user_name, email from public.users WHERE user_id='${req.session.user_id}';`;
  var accountQuery = `SELECT balance, earnings, deposited, money_lost, user_id from public.account WHERE user_id='${req.session.user_id}';`;
  db.task("/account", (task) => {
    return task.batch([task.any(usersQuery), task.any(accountQuery)]);
  })
    .then((data) => {
      res.render("pages/account", {
        local_css: "account.css",
        my_title: "Account",
        data,
        loggedin: req.session.loggedin,
      });
    })
    .catch((err) => {
      console.log("error", err);
      res.render("pages/account", {
        local_css: "account.css",
        my_title: "Account",
        data: "",
        loggedin: req.session.loggedin,
      });
    });
});

app.post("/account/edit", function (req, res) {
  var fieldToEdit = Object.keys(req.body)[0];
  var newValue = req.body[fieldToEdit];
  console.log(newValue);
  console.log(fieldToEdit);
  var fieldGuide = {
    name: ["leaderboard", "users"],
    user_name: ["leaderboard", "users"],
    balance: ["account"],
    email: ["users"],
  };
  var query = { 0: "", 1: "SELECT user_id FROM public.users;" };
  for (let i = 0; i < fieldGuide[fieldToEdit].length; i++) {
    if (fieldToEdit == "balance") {
      query[i] = `UPDATE public.${fieldGuide[fieldToEdit][i]} SET ${fieldToEdit} = ${fieldToEdit} + ${newValue} WHERE user_id='${req.session.user_id}';`;
      query["1"] = `UPDATE public.account SET deposited = deposited + ${newValue} WHERE user_id='${req.session.user_id}';`;
    } else {
      query[i] = `UPDATE public.${fieldGuide[fieldToEdit][i]} SET ${fieldToEdit} = '${newValue}' WHERE user_id='${req.session.user_id}';`;
    }
  }
  console.log(query);
  db.task("/account/edit", (task) => {
    return task.batch([task.any(query["0"]), task.any(query["1"])]);
  })
    .then((data) => {
      res.redirect("/account");
    })
    .catch((err) => {
      console.log("error", err);
    });
});

const port = process.env.PORT || 3000;
module.exports.server = app.listen(port, function () {
  console.log("App is running on port " + port);
});
