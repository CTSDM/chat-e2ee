import express from "express";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import { env, corsConfig } from "../config/config.js";
import signupRoute from "./routes/signup.js";
import loginRoute from "./routes/login.js";
import userRoute from "./routes/user.js";
import groupRoute from "./routes/group.js";
import logoutRoute from "./routes/logout.js";
import webSocket from "./websockets/webSocket.js";

const app = express();

import "../config/passport.js";

app.use(cookieParser());
app.use(cors(corsConfig));
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/login", loginRoute);
app.use("/signup", signupRoute);
app.use("/users", userRoute);
app.use("/groups", groupRoute);
app.use("/logout", logoutRoute);

const server = app.listen(env.port, () => console.log(`Listening on port ${env.port}`));
webSocket(server);
