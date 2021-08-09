import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import { config } from './config.js';
import tweetsRoute from './router/tweet.js';
import authRoute from './router/auth.js';
import { initSocket } from './connection/socket.js';
import {
    db,
    sequelize,
    connectMongoDB,
    connectMongoose,
} from './data/db/database.js';

import * as db2 from './data/database.js';

const corsOption = {
    origin: config.cors.allowedOrigin,
    optionsSuccessStatus: 200,
};

const app = express();

app.use(express.json()); // REST API - Body
app.use(express.urlencoded({ extended: false })); // HTML Form -> Body
app.use(cookieParser());
app.use(morgan('tiny'));
app.use(helmet());
app.use(cors(corsOption));

app.use('/tweets', tweetsRoute);
app.use('/auth', authRoute);

app.use((req, res, next) => {
    res.sendStatus(404);
});
app.use((error, req, res, next) => {
    console.error(error);
    res.sendStatus(500);
});

// // for MySQL
// db.getConnection().then((conn) => {
//     console.log('MySQL Server connected!');
//     console.log(`Servr is started... ${new Date()}`);
//     const server = app.listen(config.host.port);
//     initSocket(server);
// });

// for Sequelize (ORM)
sequelize.sync().then(() => {
    console.log('Sequelize (ORM) ready!');
    console.log(`Servr is started... ${new Date()}`);
    const server = app.listen(config.host.port);
    initSocket(server);
});

// // for MongoDB (NoSQL)
// connectMongoDB().then(() => {
//     console.log('MongoDB Cloud connected!');
//     console.log(`Servr is started... ${new Date()}`);
//     const server = app.listen(config.host.port);
//     initSocket(server);
// });

// // for mongoose (ODM)
// connectMongoose().then(() => {
//     console.log('MongoDB Cloud connected! mongoose');
//     console.log(`Servr is started... ${new Date()}`);
//     const server = app.listen(config.host.port);
//     initSocket(server);
// });

// db2.connect().then(() => {
//     console.log('MongoDB Cloud connected! mongoose');
//     const server = app.listen(config.host.port);
//     initSocket(server);
// });
