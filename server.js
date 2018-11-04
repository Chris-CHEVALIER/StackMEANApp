// Chargement des Middlewares :
const express = require("express");
const app = express();
const path = require("path");
const pgClient = require("pg");
const sha1 = require('sha1');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

// Declaration des variables
const port = "3115";

// Configuration du serveur NodeJS - Port : 3xxx
app.use("/css", express.static(__dirname + "/CERIGame/css"));
app.use("/images", express.static(__dirname + "/CERIGame/images"));
app.use("/scripts", express.static(__dirname + "/CERIGame/scripts"));
app.use(session({
  secret: 'brudru',
  saveUninitialized: false,
  resave: false,
  store: new MongoDBStore({
    uri: 'mongodb://127.0.0.1:27017/db',
    collection: 'MySuperSession' + port,
    touchAfter: 24 * 3600
  }),
  cookie: {
    maxAge: 24 * 3600 * 1000
  }
}))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
app.listen(port, function() {
  console.log("CERIGame lancé sur le port", port);
});

// Gestion des URI

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/CERIGame/index.html"));
});

app.get("/dateUser", function(req, res) {
  let date = req.session
  console.log(date);
  res.send("prout")
})

app.get("/login", function(req, res) {
  res.send(req.query);
  console.log(req.query);
  var pool = new pgClient.Pool({
    user: "uapv1602171",
    host: "127.0.0.1",
    database: "etd",
    password: "ti9Ki8"
  });
  pool.connect((err, client, done) => {
    if (err) console.log("error " + err.stack);
    else {
      // 1234
      let sql = "select * from fredouil.users where identifiant='" + req.query.login + "' and motpasse='" + sha1(req.query.pwd) + "';";
      client.query(sql, (err, res) => {
        if (err) console.log("error " + err.stack);
        else {
          req.session.isConnected = true
          req.session.username = req.query.login
          req.session.date = new Date()
          req.session.save()
        }
      })
    }
  });
});