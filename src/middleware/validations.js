import { body, validationResult } from "express-validator";
import { env } from "../../config/config.js";
import { cryptoUtils } from "../utils/utils.js";
import { dataManipulationUtils as dataManipulation } from "../utils/utils.js";
import db from "../db/queries.js";

function checkErrors(req, res, next) {
    const errors = validationResult(req);
    const errMsgArray = [];
    if (!errors.isEmpty()) {
        errors.array().map((err) => errMsgArray.push(err.msg));
        return res.status(400).json({ errMsg: errMsgArray });
    } else {
        next();
    }
}

function checkLength(id, type, min, max) {
    return id
        .isLength({ min: min, max: max })
        .withMessage(`The ${type} should be between ${min} and ${max} characters.`);
}

function checkWhiteSpaces(id, type) {
    return id
        .custom((value) => !/\s/.test(value))
        .withMessage(`The ${type} cannot contain white spaces.`);
}

function checkRegex(id, type, regex, message) {
    return id.custom((value) => {
        if (regexValidation(value, regex) === false) {
            throw new Error("The " + type + " " + message);
        } else {
            return true;
        }
    });
}

function regexValidation(value, regex) {
    const reg = new RegExp(String.raw`${regex}`);
    return reg.test(value);
}

function checkAlphaNumerical(id, type) {
    return id
        .isAlphanumeric()
        .withMessage(`The ${type} can only be composed of letters and numbers.`);
}

function checkNotEmpty(id, type) {
    return id.trim().notEmpty().withMessage(`The ${type} cannot be empty`);
}

function checkPublicKey(id) {
    return [
        // we import the public key to make sure it is a key.
        checkNotEmpty(body(id), "public key"),
        checkValidityPublicKey(body(id)),
    ];
}

function checkValidityPublicKey(id) {
    return id.custom(async (arrStr) => {
        const keyJWK = dataManipulation.uInt8ArrayToStr(arrStr);
        const key = await cryptoUtils.importKey(keyJWK);
        const result = await cryptoUtils.isPublicKey(key);
        if (result) return true;
        new Error("The imported public key is not a valid key.");
    });
}

function checkPassword(id) {
    return [
        checkLength(
            body(id),
            "password",
            env.validation.users.password.minLength,
            env.validation.users.password.maxLength,
        ),
        checkRegex(
            body(id),
            "password",
            env.validation.users.password.regex,
            env.validation.users.password.message,
        ),
    ];
}

function checkUint8Arr(id, type) {
    return body(id).custom((_, { req }) => {
        const arrUint8 = dataManipulation.stringArrToUint8(req.body[id]);
        if (arrUint8 === false) {
            throw new Error(`Not a valid object for ${type}`);
        } else {
            if (arrUint8.length !== env.validation.encryption[id]) {
                throw new Error(`Not a valid Uint8Arr in ${type}`);
            }
        }
        return true;
    });
}

function checkUsername(id, type) {
    return [
        checkAlphaNumerical(body(id), type),
        checkLength(
            body(id),
            type,
            env.validation.users.username.minLength,
            env.validation.users.username.maxLength,
        ),
        checkWhiteSpaces(body(id), type),
        checkRegex(
            body(id),
            type,
            env.validation.users.username.regex,
            env.validation.users.username.message,
        ),
        checkUsernameAvailability(id, type),
    ];
}

function checkUsernameAvailability(id, type) {
    return body(id).custom(async (value) => {
        try {
            const userDB = await db.getUser(id, value);
            if (userDB) {
                throw new Error(`The ${type} is already taken`);
            }
        } catch (err) {
            console.log(err);
            throw new Error("Something went wrong in the database");
        }
        return true;
    });
}

const signup = [
    checkUsername("privateUsername", "private username"),
    checkUsername("publicUsername", "public username"),
    checkPublicKey("publicKey"),
    checkPassword("password"),
    checkUint8Arr("salt", "salt"),
    checkUint8Arr("iv", "iv"),
];

const login = [
    checkNotEmpty(body("privateUsername"), "private username"),
    checkNotEmpty(body("password"), "password"),
];

const validation = { signup, login, checkErrors, checkUsername };
export default validation;
export { regexValidation };
