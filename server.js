// Chargement des Middlewares :
const express = require("express");
const app = express();
const path = require("path");
const pgClient = require("pg");

// Declaration des variables
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use("/css", express.static(__dirname + "/CERIGAME/css"));
app.use("/images", express.static(__dirname + "/CERIGame/images"));
app.use("/scripts", express.static(__dirname + "/CERIGame/scripts"));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
});
// Configuration du serveur NodeJS - Port : 3xxx
const port = "3115";
app.listen(port, function() {
    console.log("CERIGame lancé sur le port", port);
});

// Gestion des URI
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname + "/CERIGame/index.html"));
});
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
        else console.log("oué");
    });
});
