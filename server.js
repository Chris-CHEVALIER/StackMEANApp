// Chargement des Middlewares :
const express = require("express");
const app = express();
var path = require("path");

// Declaration des variables
app.use("/css", express.static(__dirname + "/CERIGAME/css"));
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));

// Configuration du serveur NodeJS - Port : 3xxx
const port = "3115";
app.listen(port, function() {
  console.log("CERIGame lancé sur le port", port);
});

// Gestion des URI
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/CERIGame/index.html"));
  console.log(res);
});