import mysql from 'mysql2';
import { config } from '../../config.js';
import SQ from 'sequelize';
import MongoDB from 'mongodb';
import mongoose from 'mongoose';

// for MySQL
const pool = mysql.createPool({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
});
export const db = pool.promise();

// for Sequelize (ORM)
const { host, database, user, password } = config.db;
export const sequelize = new SQ.Sequelize(database, user, password, {
    host,
    dialect: 'mysql',
    logging: false,
});

// for MongoDB (NoSQL)
let mongoDB;

export function getUsers() {
    return mongoDB.collection('users');
}
export function getTweets() {
    return mongoDB.collection('tweets');
}
export function connectMongoDB() {
    return MongoDB.MongoClient.connect(config.db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then((client) => {
        mongoDB = client.db();
    });
}

// for mongoose

export function connectMongoose() {
    return mongoose.connect(config.db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
}

export function useVirtualId(schema) {
    // _id -> id
    schema.virtual('id').get(function () {
        return this._id.toString();
    });
    schema.set('toJSON', { virtuals: true });
    schema.set('toObject', { virtuals: true });
}

// const MongoClient = require('mongodb').MongoClient;
// const assert = require('assert');

// // Connection URL
// const url = 'mongodb://localhost:27017';

// // Database Name
// const dbName = 'myproject';

// // Create a new MongoClient
// const client = new MongoClient(url);

// // Use connect method to connect to the Server
// client.connect(function(err) {
//   assert.equal(null, err);
//   console.log("Connected successfully to server");

//   const db = client.db(dbName);

//   client.close();
// });
