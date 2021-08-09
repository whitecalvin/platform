import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userRepository from '../data/auth.js';
import { config } from '../config.js';

export async function signup(req, res) {
    const { username, password, name, email, url } = req.body;

    const found = await userRepository.findByUsername(username);

    if (found) {
        return res.status(409).json({ message: `${username} already exists` });
    }

    // 암호화
    const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
    const userId = await userRepository.createUser({
        username,
        password: hashed,
        name,
        email,
        url,
    });

    const token = createJwtToken(userId);
    res.status(201).json({ token, username });
}

export async function login(req, res) {
    const { username, password } = req.body;
    const user = await userRepository.findByUsername(username);
    if (!user) {
        return res.status(401).json({ message: `Invalid user or password` });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ message: `Invalid user or password` });
    }

    const token = createJwtToken(user.id);
    res.status(200).json({ username, token });
}

export async function me(req, res) {
    const user = await userRepository.findById(req.userId);
    if (!user) {
        return res.status(404).json({ message: `User not found` });
    }
    res.status(200).json({ username: user.username });
}

export async function getUser(req, res) {
    const username = req.params.username;
    const user = await authRepository.getByUsername(username);

    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: `User ${username} not found` });
    }
}

export async function withdraw(req, res) {
    const username = req.params.username;
    const user = await authRepository.remove(username);

    if (user) {
        res.status(204).json(user);
    } else {
        res.status(404).json({ message: `User ${username} not found` });
    }
}

function createJwtToken(id) {
    return jwt.sign({ id }, config.jwt.secretKey, {
        expiresIn: config.jwt.expiresInSec,
    });
}
