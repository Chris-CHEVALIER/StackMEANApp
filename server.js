// Chargement des Middlewares :
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const pgClient = require("pg");
const sha1 = require('sha1');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const MongoClient = require('mongodb').MongoClient;
const mongoUrl = "mongodb://127.0.0.1:27017/db"
var pool = new pgClient.Pool({
  user: "uapv1602171",
  host: "127.0.0.1",
  database: "etd",
  password: "ti9Ki8"
});
// Declaration des variables
const port = "3115";

// Configuration du serveur NodeJS - Port : 3xxx
app.use("/css", express.static(__dirname + "/CERIGame/css"));
app.use("/images", express.static(__dirname + "/CERIGame/images"));
app.use("/scripts", express.static(__dirname + "/CERIGame/scripts"));
app.use("/app", express.static(__dirname + "/CERIGame/app"));
app.use("/modules", express.static(__dirname + "node_modules/"));
app.use(express.static(__dirname + "/CERIGame/public"))
app.use(bodyParser.json())
app.use(session({
  secret: 'brudru',
  saveUninitialized: false,
  resave: false,
  store: new MongoDBStore({
    uri: mongoUrl,
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

app.post('/getGamePlayed', function(req, res) {
  pool.connect((err, client, done) => {
    if (err) console.log("error " + err.stack);
    else {
      let sql = "select * from fredouil.historique where id_users = '" + req.body.id + "';";
      client.query(sql, (err, result) => {
        res.json(result)
      })
    }
  })
})

app.get("/logout", (req, res) => {
  pool.connect((err, client, done) => {
    if (err) console.log("error " + err.stack);
    else {
      let sql = "update fredouil.users set statut = 0 where identifiant='" + req.session.username + "';";
      client.query(sql, (err, result) => {
        req.session.destroy();
        res.sendStatus(200)
      })
    }
  })
})

function formatDate(date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

function getLastRecord(callback) {
  MongoClient.connect(mongoUrl, function(err, client) {
    client.db("db").collection("MySuperSession" + port).find().limit(1).sort({
      $natural: -1
    }).toArray().then((data) => {
      console.log("nani")
      console.log(data);
      callback(data)
    })
  })
}

app.get('/prout', (req, res) => {
  getLastRecord((data) => {
    res.json(data)
  })
})

app.post("/login", (req, res) => {
  pool.connect((err, client, done) => {
    if (err) console.log("error " + err.stack);
    else {
      let sql = "select * from fredouil.users where identifiant='" + req.body.usr + "' and motpasse='" + sha1(req.body.pwd) + "';";
      client.query(sql, (err, result) => {
        if (err || result.rows.length === 0) {
          res.send({
            status: 500
          })
        } else {
          sql = "update fredouil.users set statut = 1 where identifiant='" + req.body.usr + "';";
          client.query(sql, (e, r) => {
            req.session.isConnected = true
            req.session._id = result.rows[0].id
            req.session.username = req.body.usr
            req.session.lastname = result.rows[0].nom
            req.session.prename = result.rows[0].prenom
            req.session.bday = result.rows[0].date_de_naissance
            req.session.avatar = result.rows[0].avatar
            req.session.date = new Date()
            req.session.save()
            res.send({
              name: req.body.usr,
              date: formatDate(req.session.date),
              id: result.rows[0].id,
              prenom: result.rows[0].prenom,
              nom: result.rows[0].nom,
              bday: result.rows[0].date_de_naissance,
              avatar: result.rows[0].avatar,
              status: 200
            })
          });
        }
      })
    }
  });
});