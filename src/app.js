import express from "express";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import { env, corsConfig } from "../config/config.js";
import signupRoute from "./routes/signup.js";
import loginRoute from "./routes/login.js";

const app = express();

app.use(cookieParser());
app.use(cors(corsConfig));
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/login", loginRoute);
app.use("/signup", signupRoute);

app.listen(env.port, () => console.log(`Listening on port ${env.port}`));
