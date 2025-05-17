import checks from "../../../src/utils/checks.js";
import { v4 as uuidv4 } from "uuid";
import { v6 as uuidv6 } from "uuid";
import { describe, it, expect } from "@jest/globals";

describe("The function that checks uuid", () => {
    it("should work for several random generated uuid v4", () => {
        const size = 9999;
        for (let i = 0; i < size; ++i) {
            expect(checks.uuid(uuidv4())).toBeTruthy();
        }
    });

    it("should not work for random generated uuid that are not v4", () => {
        const size = 100;
        for (let i = 0; i < size; ++i) {
            expect(() => {
                checks.uuid(uuidv6());
            }).toThrowError();
        }
    });

    it("should not work for pseudo like uuid v4", () => {
        const size = 100;
        for (let i = 0; i < size; ++i) {
            expect(() => {
                checks.uuid(createUUIDv4Alike());
            }).toThrowError();
        }
    });
});

describe("The function that checks the type ArrayBuffer", () => {
    it("should work for an ArrayBuffer of length greater than 1 without specifying the byte length", () => {
        const arrBuff = new ArrayBuffer(100);
        expect(checks.arrayBuffer(arrBuff)).toBeTruthy();
    });

    it("should not work for an ArrayBuffer of length 0", () => {
        const arrBuff = new ArrayBuffer(0);
        expect(() => {
            checks.arrayBuffer(arrBuff);
        }).toThrowError();
    });

    it("should not work when checking the byte length ArrayBuffer a non number it is used", () => {
        const arrBuff = new ArrayBuffer(100);
        const len = "1"; // it should be a number, not a string
        expect(() => {
            checks.arrayBuffer(arrBuff, len);
        }).toThrowError();
    });

    it("should work when checking the byte length ArrayBuffer", () => {
        const len = 100;
        const arrBuff = new ArrayBuffer(len);
        expect(checks.arrayBuffer(arrBuff, len)).toBeTruthy();
    });

    it("should not work when checking the byte length ArrayBuffer with byte length equalt to zero", () => {
        const len = 0;
        const arrBuff = new ArrayBuffer(len);
        expect(() => {
            checks.arrayBuffer(arrBuff, len);
        }).toThrowError();
    });

    it("should not work when trying to checking a buffer or an UInt8Array", () => {
        const listIncorrect = [];
        listIncorrect.push(Buffer.from(new ArrayBuffer(100)));
        listIncorrect.push(Buffer.from(new Uint8Array([1, 2, 3])));
        listIncorrect.forEach((item) => {
            expect(() => {
                checks.arrayBuffer(item);
            }).toThrowError();
        });
    });
});

describe("The function that checks date", () => {
    it("should work for a valid date", () => {
        expect(checks.date(Date.now())).toBeTruthy();
    });

    it("should work for a valid date with lower bound", () => {
        const limits = { lower: Date.now() - 60 * 1000 };
        expect(checks.date(Date.now(), limits)).toBeTruthy();
    });

    it("should work for a valid date with upper bound", () => {
        const limits = { upper: Date.now() + 60 * 1000 };
        expect(checks.date(Date.now(), limits)).toBeTruthy();
    });

    it("should not work for a valid date with an incorrect lower bound", () => {
        const limits = { lower: Date.now() + 60 * 1000 };
        expect(() => {
            checks.date(Date.now(), limits);
        }).toThrowError();
    });

    it("should not work for a valid date with an incorrect upper bound", () => {
        const limits = { upper: Date.now() - 60 * 1000 };
        expect(() => {
            checks.date(Date.now(), limits);
        }).toThrowError();
    });

    it("should work for a valid date with correct bounds", () => {
        const limits = { upper: Date.now() + 60 * 1000, lower: Date.now() - 60 };
        expect(checks.date(Date.now(), limits)).toBeTruthy();
    });
});

// auxiliary function
function createUUIDv4Alike() {
    const pool = "abcdefghijklmnopqrstuvwxyz0123456789";
    const uuidv4Length = 36;
    const newUUID = [];
    for (let i = 0; i < uuidv4Length; ++i) {
        const indexRandom = Math.floor(Math.random() * pool.length);
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            newUUID.push("-");
        } else if (i === 14) {
            // we make sure that is it not uuid v4
            newUUID.push("5");
        } else {
            newUUID.push(pool[indexRandom]);
        }
    }
    return newUUID.join("");
}
