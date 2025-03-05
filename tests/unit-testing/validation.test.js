import { regexValidation } from "../../src/middleware/validations";
import { passwords } from "../validInputs.js";
import { env } from "../../config/config.js";
import { describe, it, expect } from "@jest/globals";

describe("The password regex validator should", () => {
    const regex = env.validation.users.password.regex;

    it("work for the set of valid passwords", () => {
        passwords.valid.forEach((password) => {
            expect(regexValidation(password, regex)).toBeFalsy;
        });
    });

    it("not work for the set of invalid passwords", () => {
        passwords.invalid.forEach((password) => {
            expect(regexValidation(password, regex)).toBeFalsy;
        });
    });

    it("not work for a very long password", () => {
        const passwords = ["22222222222222_aaaaaaaaaaaaaaaaaa_DDDDDDDDDDDDDDD"];
        passwords.forEach((password) => {
            expect(regexValidation(password, regex)).toBeFalsy;
        });
    });

    it("not work for a very long password", () => {
        const passwords = ["22222222222222_aaaaaaaaaaaaaaaaaa_DDDDDDDDDDDDDDD"];
        passwords.forEach((password) => {
            expect(regexValidation(password, regex)).toBeFalsy;
        });
    });
});
