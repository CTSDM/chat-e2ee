import dotenv from "dotenv";
dotenv.config();

const env = {
    port: process.env.PORT,
    clientUrl: process.env.CLIENT_URL,
    keyAccessToken: process.env.ACCESS_TOKEN,
    allowedOrigins: process.env.ALLOWED_ORIGINS,
    validation: {
        users: {
            username: {
                minLength: process.env.USERNAME_MIN_LENGTH,
                maxLength: process.env.USERNAME_MAX_LENGTH,
                regex: process.env.USERNAME_REGEX,
                message: process.env.USERNAME_REGEX_MESSAGE,
            },
            password: {
                minLength: process.env.PASSWORD_MIN_LENGTH,
                maxLength: process.env.PASSWORD_MAX_LENGTH,
                regex: process.env.PASSWORD_REGEX,
                message: process.env.PASSWORD_REGEX_MESSAGE,
            },
        },
        encryption: {
            salt: 16,
            iv: 12,
        },
    },
};

const corsConfig = {
    exposedHeaders: ["SET-COOKIES"],
    credentials: true,
    origin: (origin, cb) => {
        const allowedOrigins = env.allowedOrigins.split(" ");
        if (allowedOrigins.indexOf(origin) !== -1) {
            cb(null, true);
        } else {
            cb(new Error(`Request from unauthorized origin ${origin}`));
        }
    },
};

export { env, corsConfig };
