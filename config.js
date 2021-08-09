import dotenv from 'dotenv';

dotenv.config();

function required(key, defaultValue = undefined) {
    const value = process.env[key] || defaultValue;

    if (value === null || value === undefined) {
        throw new Error(`Key ${key} is undefined`);
    }

    return value;
}

export const config = {
    jwt: {
        secretKey: required('JWT_SECRET_KEY'),
        expiresInSec: parseInt(required('JWT_EXPIRES_SEC', 172800)),
    },
    bcrypt: {
        saltRounds: parseInt(required('BCRYPT_SALT_ROUNDS', 12)),
    },
    host: {
        port: parseInt(required('PORT', 3003)),
    },
    db: {
        type: required('DB_TYPE', 'Sequelize'),
        host: required('DB_HOST'),
        database: required('DB_DATABASE'),
        user: required('DB_USER'),
        password: required('DB_PASSWORD'),
        url: required('DB_URL'),
    },
    cors: {
        allowedOrigin: required('CORS_ALLOW_ORIGIN'),
    },
};
