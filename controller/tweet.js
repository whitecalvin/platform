import * as twitterRepository from '../data/tweet.js';
import { getSocketIO } from '../connection/socket.js';

export async function getTweets(req, res) {
    const username = req.query.username;
    const data = await (username
        ? twitterRepository.getAllByUsername(username)
        : twitterRepository.getAll());
    res.status(200).json(data);
}

export async function getTweet(req, res) {
    const id = req.params.id;
    const tweet = await twitterRepository.getById(id);

    if (tweet) {
        res.status(200).json(tweet);
    } else {
        res.status(404).json({ message: `Tweet ${id} not found` });
    }
}
export async function createTweet(req, res) {
    const { text } = req.body;
    const tweet = await twitterRepository.create(text, req.userId);
    res.status(201).json(tweet);
    getSocketIO().emit('tweets/new', tweet);
}

export async function updateTweet(req, res) {
    const id = req.params.id;
    const text = req.body.text;
    const tweet = await twitterRepository.getById(id);

    if (!tweet) {
        return res.sendStatus(404);
    }
    if (tweet.userId !== req.userId) {
        return res.sendStatus(403);
    }

    const updated = await twitterRepository.update(id, text);

    res.status(200).json(updated);
    getSocketIO().emit('tweets/put', tweet);
}

export async function removeTweet(req, res) {
    const id = req.params.id;
    const tweet = await twitterRepository.getById(id);
    if (!tweet) {
        return res.status(404).json({ message: `Tweet not found: ${id}` });
    }
    if (tweet.userId !== req.userId) {
        return res.sendStatus(403);
    }

    await twitterRepository.remove(id);
    res.sendStatus(204);

    getSocketIO().emit('tweets/del', tweet);
}
