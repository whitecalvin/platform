import express from 'express';
import { body, param, validationResult } from 'express-validator';
import 'express-async-errors';

import * as authController from '../controller/auth.js';
import { validate } from '../middleware/validator.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

const validateCredential = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('사용자 아이디를 입력하세요')
        .isLength({ min: 5 })
        .withMessage('사용자 아이디는 5자 이상이어야 합니다'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('비밀번호를 입력하세요')
        .isLength({ min: 5 })
        .withMessage('비밀번호는 5자 이상이어야 합니다'),
    validate,
];
const validateSignup = [
    ...validateCredential,
    body('name')
        .trim()
        .notEmpty()
        .withMessage('사용자 이름을 입력하세요')
        .isLength({ min: 5 })
        .withMessage('사용자 이름은 5자 이상이어야 합니다'),
    body('email').isEmail().normalizeEmail().withMessage('잘못된 이메일입니다'),
    body('url')
        .isURL()
        .withMessage('잘못된 URL 입니다')
        .optional({ nullable: true, checkFalsy: true }),
    validate,
];

// POST /auth/signup
router.post('/signup', validateSignup, authController.signup);

// PUT /auth/login
router.post('/login', validateCredential, authController.login);

// GET /auth/me
router.get('/me', isAuth, authController.me);

// // PUT /auth/logout
// router.get('/logout', authController.logout);

// // GET /auth/me/:username
// router.get('/me/:username', authController.getUser);

// // DELETE /auth/withdraw/:username
// router.delete('/withdraw/:username', authController.withdraw);

export default router;
