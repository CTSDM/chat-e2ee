import { strict as assert } from "node:assert";
import { env } from "../../config/config.js";

// we expect an array coming from JSON.stringify
function stringArrToUint8(stringArr) {
    try {
        const arr = JSON.parse(stringArr);
        return new Uint8Array(arr);
    } catch {
        return false;
    }
}

// we expect an array coming from JSON.stringify
function stringArrToBuffer(stringArr) {
    try {
        const arr = JSON.parse(stringArr);
        const buffer = Buffer.from(arr);
        return buffer;
    } catch {
        return false;
    }
}

function stringToBuffer(str) {
    try {
        const enc = new TextEncoder();
        return enc.encode(str);
    } catch {
        return false;
    }
}

function intToBuffer(int) {
    return new Uint16Array([int]).buffer;
}

function intToUint8Array(int) {
    const arr = new Uint8Array(2);
    arr[0] = int & 0xff;
    arr[1] = (int >> 8) & 0xff;
    return arr;
}

function stringToUint8Array(str) {
    const enc = new TextEncoder();
    const arr = enc.encode(str);
    const maxLength = env.validation.users.username.maxLength;
    assert.deepEqual(arr.length > maxLength, false);
    // we pad with array of 0 a new uint8array, in case it is needed
    return new Uint8Array([...new Array(maxLength - arr.length), ...arr]);
}

function concatUint8Arr(arrUint8Arr) {
    assert(arrUint8Arr.length > 0, "Array length must be greater than 1");
    arrUint8Arr.forEach((arr) => {
        assert(
            Object.getPrototypeOf(new Uint8Array()) === Object.getPrototypeOf(arr),
            "The array is not fully composed of Uint8Array",
        );
    });
    const arrSize = arrUint8Arr.reduce((total, arr) => total + arr.length, 0);
    const Uint8ArrConcat = new arrUint8Arr[0].constructor(arrSize);
    let currentIndex = 0;
    for (let i = 0; i < arrUint8Arr.length; ++i) {
        Uint8ArrConcat.set(arrUint8Arr[i], currentIndex);
        currentIndex += arrUint8Arr[i].length;
    }
    return Uint8ArrConcat;
}

export default {
    stringArrToUint8,
    stringArrToBuffer,
    stringToBuffer,
    intToBuffer,
    stringToUint8Array,
    concatUint8Arr,
    intToUint8Array,
};
