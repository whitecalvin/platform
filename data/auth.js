import SQ from 'sequelize';
import MongoDB from 'mongodb';
import mongoose from 'mongoose';
import { config } from '../config.js';
import { db, sequelize, getUsers, useVirtualId } from './db/database.js';

const ObjectId = MongoDB.ObjectId;

const dbType = config.db.type;

const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    url: String,
});

useVirtualId(userSchema);

const mg_user = mongoose.model('user', userSchema);

// Memory
let users = [
    {
        id: '1628195975600',
        username: 'ellie1',
        password:
            '$2b$12$NHmJcDCsxPBTAGxHk7jtIe2pGdQn7f7V4cZrnBnIDVgb5zXBddcAW',
        name: 'Ellie1',
        email: 'ellie@server.com',
        url: 'https://widgetwhats.com/app/uploads/2019/11/free-profile-photo-whatsapp-1.png',
    },
    {
        id: '1628195975601',
        username: 'ellie2',
        password:
            '$2b$12$NHmJcDCsxPBTAGxHk7jtIe2pGdQn7f7V4cZrnBnIDVgb5zXBddcAW',
        name: 'Ellie2',
        email: 'ellie2@server.com',
        url: 'https://widgetwhats.com/app/uploads/2019/11/free-profile-photo-whatsapp-1.png',
    },
    {
        id: '1628195975602',
        username: 'ellie3',
        password:
            '$2b$12$NHmJcDCsxPBTAGxHk7jtIe2pGdQn7f7V4cZrnBnIDVgb5zXBddcAW',
        name: 'Ellie3',
        email: 'ellie3@server.com',
        url: 'https://widgetwhats.com/app/uploads/2019/11/free-profile-photo-whatsapp-1.png',
    },
];

// Sequelize (ORM) - User Table Define
const DataTypes = SQ.DataTypes;

export const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(45),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    url: DataTypes.TEXT,
});

export async function createUser(user) {
    switch (dbType) {
        case 'MEM':
            // Memory
            const created = { ...user, id: Date.now().toString() };
            users.push(created);
            return created.id;
        case 'SQL':
            // MySQL
            const { username, password, name, email, url } = user;
            return db
                .execute(
                    'INSERT INTO users (username, password, name, email, url) VALUES(?,?,?,?,?)',
                    [username, password, name, email, url]
                )
                .then((result) => result[0].insertId);
        case 'SEQ':
            // Sequelize (ORM)
            return User.create(user).then((data) => data.dataValues.id);
        case 'MON':
            // MongoDB (NoSQL)
            return getUsers()
                .insertOne(user)
                .then((result) => result.insertedId.toString());
        case 'MNG':
            // mongoose (ODM)
            return new mg_user(user).save().then((data) => data.id);
    }
}

export async function findByUsername(username) {
    switch (dbType) {
        case 'MEM':
            // Memory
            return users.find((user) => user.username === username);
        case 'SQL':
            // MySQL
            return db
                .execute('SELECT * FROM users WHERE username=?', [username])
                .then((result) => result[0][0]);
        case 'SEQ':
            // Sequelize (ORM)
            return User.findOne({ where: { username } });
        case 'MON':
            // MongoDB (NoSQL)
            return getUsers()
                .find({ username })
                .next()
                .then((user) => mapOtionalUser(user));
        case 'MNG':
            // mongoose (ODM)
            return mg_user.findOne({ username });
    }
}
export async function findById(id) {
    switch (dbType) {
        case 'MEM':
            // Memory
            return users.find((user) => user.id === id);
        case 'SQL':
            // MySQL
            return db
                .execute('SELECT * FROM users WHERE id=?', [id])
                .then((result) => result[0][0]);
        case 'SEQ':
            // Sequelize (ORM)
            return User.findByPk(id);
        // return User.findOne({ where: { id } });
        case 'MON':
            // MongoDB (NoSQL)
            return getUsers()
                .find({ _id: new ObjectId(id) })
                .next()
                .then((user) => mapOtionalUser(user));
        case 'MNG':
            // mongoose (ODM)
            return mg_user.findById(id);
    }
}
export async function login(username, password) {
    switch (dbType) {
        case 'MEM':
            // Memory
            return users.find(
                (user) =>
                    user.username === username && user.password === password
            );
        case 'SQL':
            // MySQL
            return db
                .execute(
                    'SELECT * FROM users WHERE username=? AND password=?',
                    [username, password]
                )
                .then((result) => result[0][0]);
        case 'SEQ':
            // Sequelize (ORM)
            return User.findOne({ where: { username, password } });
        case 'MON':
            // MongoDB (NoSQL)
            return getUsers()
                .find({ $and: [{ username }, { password }] })
                .next()
                .then((user) => mapOtionalUser(user));
        case 'MNG':
            // mongoose (ODM)
            return mg_user.findOne({ $and: [{ username }, { password }] });
    }
}

function mapOtionalUser(user) {
    return user ? { ...user, id: user._id.toString() } : user;
}
