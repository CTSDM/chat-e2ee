import dotenv from "dotenv";
dotenv.config();

const env = {
    port: process.env.PORT,
    clientUrl: process.env.CLIENT_URL,
    secretAccessToken: process.env.ACCESS_TOKEN,
    secretRefreshToken: process.env.REFRESH_TOKEN,
    allowedOrigin: process.env.ALLOWED_ORIGIN,
    devStatus: process.env.DEV_STATUS === "1" ? true : false,
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
    dbMessages: {
        delete: {
            notFound: "Record to delete does not exist.",
        },
    },
};

env.cookie = {
    options: {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    },
    maxAge: 1000 * 60 * 60 * 24,
};

const corsConfig = {
    exposedHeaders: ["SET-COOKIES"],
    credentials: true,
    origin: (origin, cb) => {
        if (env.allowedOrigin === origin) {
            cb(null, true);
        } else {
            cb(new Error(`Request from unauthorized origin ${origin}`));
        }
    },
};

export { env, corsConfig };
