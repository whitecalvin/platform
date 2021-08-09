import express from 'express';
import { body, param, validationResult } from 'express-validator';
import 'express-async-errors';

import * as twitterController from '../controller/tweet.js';
import { validate } from '../middleware/validator.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

// validation
// sanitization
// contract testing: Client-Server

const validateTweet = [
    body('text')
        .trim()
        .notEmpty()
        .withMessage('트윗을 입력하세요')
        .isLength({ min: 3 })
        .withMessage('트윗은 최소 3자이상으로 입력하세요')
        .isLength({ max: 144 })
        .withMessage('트윗은 최대 144자까지 입력하세요'),
    // body('name')
    //     .trim()
    //     .notEmpty()
    //     .withMessage('이름을 입력하세요')
    //     .isLength({ min: 2 })
    //     .withMessage('트윗은 최소 2자이상으로 입력하세요')
    //     .isLength({ max: 30 })
    //     .withMessage('트윗은 최대 30자까지 입력하세요'),
    // body('username')
    //     .trim()
    //     .notEmpty()
    //     .withMessage('이름을 입력하세요')
    //     .isLength({ min: 2 })
    //     .withMessage('트윗은 최소 2자이상으로 입력하세요')
    //     .isLength({ max: 30 })
    //     .withMessage('트윗은 최대 30자까지 입력하세요'),
    validate,
];

// GET /tweets
// GET /tweets?username=username
router.get('/', isAuth, twitterController.getTweets);

// GET /tweets/:id
router.get('/:id', isAuth, twitterController.getTweet);

// POST /tweets
router.post('/', isAuth, validateTweet, twitterController.createTweet);

// PUT /tweets/:id
router.put('/:id', isAuth, validateTweet, twitterController.updateTweet);

// DELETE /tweets/:id
router.delete('/:id', isAuth, twitterController.removeTweet);

export default router;
