import dotenv from "dotenv";
dotenv.config();

const env = {
    port: process.env.PORT,
    clientUrl: process.env.CLIENT_URL,
    secretAccessToken: process.env.ACCESS_TOKEN,
    secretRefreshToken: process.env.REFRESH_TOKEN,
    allowedOrigins: process.env.ALLOWED_ORIGINS,
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
};

env.cookie = {
    options: {
        httpOnly: true,
        secure: env.devStatus ? false : true,
        sameSite: "none",
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
