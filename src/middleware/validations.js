import { body, param, validationResult } from "express-validator";
import { env } from "../../config/config.js";
import { cryptoUtils } from "../utils/utils.js";
import { dataManipulationUtils as dataManipulation } from "../utils/utils.js";

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
        throw new Error("Something went wrong while importing or validating your public key.");
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

function checkUsername(id, type, fn) {
    return [
        checkAlphaNumerical(fn(id), type),
        checkLength(
            fn(id),
            type,
            env.validation.users.username.minLength,
            env.validation.users.username.maxLength,
        ),
        checkWhiteSpaces(fn(id), type),
        checkRegex(
            fn(id),
            type,
            env.validation.users.username.regex,
            env.validation.users.username.message,
        ),
    ];
}

function sanitizeCase(id) {
    return id.toLowerCase();
}

const signup = [
    checkUsername("privateUsername", "private username", body),
    sanitizeCase(body("privateUsername")),
    checkUsername("publicUsername", "public username", body),
    checkPublicKey("publicKey"),
    checkPassword("password"),
    checkUint8Arr("salt", "salt"),
    checkUint8Arr("iv", "iv"),
];

const login = [
    checkNotEmpty(body("privateUsername"), "private username"),
    sanitizeCase(body("privateUsername")),
    checkNotEmpty(body("password"), "password"),
];

const addUserContact = [
    checkNotEmpty(param("username"), "public username"),
    sanitizeCase(param("username")),
    checkUsername("username", "public username", param),
];

const validation = { addUserContact, signup, login, checkErrors, checkUsername };
export default validation;
export { regexValidation };
