import SQ from 'sequelize';
import MongoDB from 'mongodb';
import { config } from '../config.js';
import { db, sequelize, getUsers, getTweets } from './db/database.js';
import { User } from './auth.js';
import * as userRepository from './auth.js';

// NoSQL 을 쓰는 포인트
// 프로필 서버
// 사용자의의 문서 서버 ✅ -> 서버1, 서버2, 서버3
// NoSQL 정보의 중복성 > 관례 : 쿼리의 성능을 위해서
// 사용자가 변경 -> 트윗 업데이트
// 사용자가 모든 트위

const ObjectId = MongoDB.ObjectId;

const Sequelize = SQ.Sequelize;

const dbType = config.db.type;

// Memory
let tweets = [
    {
        id: '1',
        text: '드림코딩에서 강의 들으면 너무 좋으다',
        createdAt: new Date().toString(),
        userId: '1628195975600',
    },
    {
        id: '2',
        text: '드림코딩에서 강의 들으면 너무 좋으다1',
        createdAt: new Date().toString(),
        userId: '1628195975601',
    },
    {
        id: '3',
        text: '드림코딩에서 강의 들으면 너무 좋으다2',
        createdAt: new Date().toString(),
        userId: '1628195975602',
    },
];

// Sequelize (ORM) - Tweet Table Define
const DataTypes = SQ.DataTypes;

const Tweet = sequelize.define('tweet', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

Tweet.belongsTo(User);

// for MySQL
const SQL_SELECT_JOIN =
    'SELECT l.id, l.text, l.createdAt, l.userId, a.username, a.name, a.url FROM tweets AS l INNER JOIN users AS a ON a.id = l.userId';
const SQL_ORDER_DESC = 'ORDER BY l.createdAt DESC';

// for Sequelize (ORM)
const SEQ_INCLUDE_USER = {
    attributes: [
        'id',
        'text',
        'createdAt',
        'userId',
        [Sequelize.col('user.name'), 'name'],
        [Sequelize.col('user.username'), 'username'],
        [Sequelize.col('user.url'), 'url'],
    ],
    include: {
        model: User,
        attributes: [],
    },
};

const SEQ_ORDER_DESC = {
    order: [['createdAt', 'DESC']],
};

export async function getAll(pageNo, pageSize) {
    switch (dbType) {
        case 'MEM':
            // Memory
            return Promise.all(
                tweets.map(async (tweet) => {
                    const { username, name, url } =
                        await userRepository.findById(tweet.userId);
                    return { ...tweet, username, name, url };
                })
            );
        case 'SQL':
            // MySQL
            return db
                .execute(`${SQL_SELECT_JOIN} ${SQL_ORDER_DESC}`, [])
                .then((result) => result[0]);
        case 'SEQ':
            // Sequelize (ORM)
            return Tweet.findAll({
                ...SEQ_INCLUDE_USER,
                ...SEQ_ORDER_DESC,
            }).then((data) => data);
        case 'MON':
            // MongoDB (NoSQL)
            return getTweets()
                .find()
                .sort({ createdAt: -1 })
                .toArray()
                .then((tweets) => mapTweets(tweets));
    }
}
export async function getAllByUsername(username) {
    switch (dbType) {
        case 'MEM':
            // Memory
            return getAll().then((tweets) =>
                tweets.filter((tweet) => tweet.username === username)
            );

        case 'SQL':
            // MySQL
            return db
                .execute(
                    `${SQL_SELECT_JOIN} WHERE a.username=? ${SQL_ORDER_DESC}`,
                    [username]
                )
                .then((result) => result[0]);
        case 'SEQ':
            // Sequelize (ORM)
            return Tweet.findAll({
                ...SEQ_INCLUDE_USER,
                ...SEQ_ORDER_DESC,
                include: {
                    ...SEQ_INCLUDE_USER.include,
                    where: { username },
                },
            }).then((data) => data);
        case 'MON':
            // MongoDB (NoSQL)
            return getTweets()
                .find({ username })
                .toArray()
                .then((tweets) => mapTweets(tweets));
    }
}
export async function getById(id) {
    switch (dbType) {
        case 'MEM':
            // Memory
            const tweet = tweets.find((t) => t.id === id);
            if (!tweet) {
                return null;
            }
            const { username, name, url } = await userRepository.findById(
                tweet.userId
            );
            return { ...tweet, username, name, url };

        case 'SQL':
            // MySQL
            return db
                .execute(`${SQL_SELECT_JOIN} WHERE l.id=?`, [id])
                .then((result) => result[0][0]);
        case 'SEQ':
            // Sequelize (ORM)
            return Tweet.findOne({
                where: { id },
                ...SEQ_INCLUDE_USER,
            }).then((data) => data);
        case 'MON':
            // MongoDB (NoSQL)
            return getTweets()
                .find({ _id: new ObjectId(id) })
                .next()
                .then((tweet) => mapOptionalTweet(tweet));
    }
}

export async function create(text, userId) {
    switch (dbType) {
        case 'MEM':
            // Memory
            const tweet = {
                id: Date.now().toString(),
                text,
                createdAt: new Date(),
                userId,
            };
            tweets = [tweet, ...tweets];
            return getById(tweet.id);
        case 'SQL':
            // MySQL
            return db
                .execute('INSERT INTO tweets (text, userId) VALUES(?,?)', [
                    text,
                    userId,
                ])
                .then((result) => getById(result[0].insertId));
        case 'SEQ':
            // Sequelize (ORM)
            return Tweet.create({ text, userId }).then((data) =>
                getById(data.dataValues.id)
            );
        case 'MON':
            // MongoDB (NoSQL)
            return userRepository
                .findById(userId)
                .then((user) => {
                    return getTweets().insertOne({
                        text,
                        createdAt: new Date(),
                        userId,
                        name: user.name,
                        username: user.username,
                        url: user.url,
                    });
                })
                .then((result) => getById(result.insertedId.toString()));
    }
}
export async function update(id, text) {
    switch (dbType) {
        case 'MEM':
            // Memory
            const tweet = tweets.find((tweet) => tweet.id === id);
            if (tweet) {
                tweet.text = text;
            }
            return getById(tweet.id);
        case 'SQL':
            // MySQL
            return db
                .execute('UPDATE tweets SET text=? WHERE id=?', [text, id])
                .then((result) => getById(id));
        case 'SEQ':
            // Sequelize (ORM)
            return Tweet.findByPk(id, SEQ_INCLUDE_USER).then((tweet) => {
                tweet.text = text;
                return tweet.save();
            });
        case 'MON':
            // MongoDB (NoSQL)
            return getTweets()
                .findOneAndUpdate(
                    { _id: new ObjectId(id) },
                    { $set: { text } },
                    { returnOriginal: false }
                )
                .then((result) => mapOptionalTweet(result.value));
        // .then(mapOptionalTweet);
        // return getTweets()
        //     .updateOne(
        //         {
        //             _id: ObjectId(id),
        //         },
        //         { $set: { text } }
        //     )
        //     .then((result) => getById(id));
    }
}

export async function remove(id) {
    switch (dbType) {
        case 'MEM':
            // Memory
            const tweet = tweets.find((tweet) => tweet.id === id);
            tweets = tweets.filter((tweet) => tweet.id !== id);
            return;
        case 'SQL':
            // MySQL
            db.execute('DELETE FROM tweets WHERE id=?', [id]).then(
                (result) => result[0].deleteId
            );
            return;
        case 'SEQ':
            // Sequelize (ORM)
            return Tweet.findByPk(id, SEQ_INCLUDE_USER).then((tweet) => {
                tweet.destroy();
            });
        case 'MON':
            // MongoDB (NoSQL)
            return getTweets().deleteOne({
                _id: new ObjectId(id),
            });
    }
}

function mapOptionalTweet(tweet) {
    return tweet ? { ...tweet, id: tweet._id.toString() } : tweet;
}

function mapTweets(tweets) {
    return tweets.map(mapOptionalTweet);
}
