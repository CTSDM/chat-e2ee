import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";
import db from "../src/db/queries.js";
import { env } from "../config/config.js";

function cookieExtractor(req) {
    if (req && req.cookies) {
        return req.cookies["access-token"];
    } else {
        return null;
    }
}

const opts = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: env.secretAccessToken,
};

passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
        const id = jwt_payload.id;
        const userFromDB = await db.getUser("id", id);
        if (userFromDB) {
            return done(null, jwt_payload);
        } else {
            return done(null, false, { msg: "user not found" });
        }
    }),
);
