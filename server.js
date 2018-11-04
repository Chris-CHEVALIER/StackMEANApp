// Chargement des Middlewares :
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
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
app.use("/app", express.static(__dirname + "/CERIGame/app"));
app.use(express.static(__dirname + "/CERIGame/public"))
app.use(bodyParser.json())
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


app.get("/dateUser", function(req, res) {
  let date = req.session
  console.log(date);
  res.send("prout")
})
app.post("/login",(req,res)=>{
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
      let sql = "select * from fredouil.users where identifiant='" + req.body.usr + "' and motpasse='" + sha1(req.body.pwd) + "';";

      client.query(sql, (err, result) => {
        if (err || result.rows.length===0) {
          res.send({
            status:500
          })
        }
        else {
          req.session.isConnected = true
          req.session.username = req.body.usr
          req.session.date = new Date()
          req.session.save()
          res.send({
            status:200
          })
        }
      })
    }
  });
});
