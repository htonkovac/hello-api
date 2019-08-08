"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");

   
var sequelize = new Sequelize(
    process.env.DB_DATABASE_NAME || "hello-api-database", 
    process.env.DB_USERNAME || "root" ,
    process.env.DB_PASSWORD || "password" ,
    {"host": process.env.DB_HOST || "localhost",
       "dialect": "mysql"});

sequelize
       .authenticate()
       .then(() => {
         console.log('Connection to DB has been established successfully.');
       })
       .catch(err => {
           console.error(err)
           //throw err;
           //This app is for some reason not crashing when it is unable to make a DB connection, throwing doesn't stop the process either. Therefore we call process.exit maanually as a dirty fix
           process.exit(1);
       });
var db = {};

fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function (file) {
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
