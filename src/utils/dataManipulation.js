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

function intToBuffer(int) {
    return new Uint16Array([int]).buffer;
}

function intToUint8Array(int, bytes) {
    const arr = new Uint8Array(bytes);
    arr[0] = int & 0xff;
    arr[1] = (int >> 8) & 0xff;
    return arr;
}

function stringToUint8Array(str, targetLength) {
    // maxLength is an integer that represents the number of bytes
    const enc = new TextEncoder();
    const arr = enc.encode(str);
    if (targetLength) {
        assert.deepEqual(arr.length > targetLength, false);
        // we pad with array of 0 a new uint8array, in case it is needed
        return new Uint8Array([...new Array(targetLength - arr.length), ...arr]);
    }
    return arr;
}

function arrBufferToString(arrBuffer) {
    const arr = new Uint8Array(arrBuffer);
    const strEncodedArr = arr.filter((value) => value !== 0);
    const dec = new TextDecoder();
    const str = dec.decode(strEncodedArr);
    return str;
}

function concatUint8Arr(arrUint8Arr) {
    assert(arrUint8Arr.length > 0, "Array length must be greater than 1");
    arrUint8Arr.forEach((arr, index) => {
        assert(
            Object.getPrototypeOf(new Uint8Array()) === Object.getPrototypeOf(arr),
            `The element at index ${index} is not an Uint8Array`,
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

function uInt8ArrayToStr(arrStr) {
    const arr = JSON.parse(arrStr);
    const dec = new TextDecoder();
    const keyJWK = dec.decode(new Uint8Array(arr));
    return keyJWK;
}

function getNumFromBuffer(buff) {
    // the buffer is considered to hold a single bit
    const view = new DataView(buff);
    return view.getUint8(0);
}

function getDateFromBuffer(buff) {
    const dateStr = arrBufferToString(buff);
    return parseInt(dateStr);
}

export default {
    stringArrToUint8,
    stringArrToBuffer,
    intToBuffer,
    stringToUint8Array,
    concatUint8Arr,
    intToUint8Array,
    uInt8ArrayToStr,
    getNumFromBuffer,
    getDateFromBuffer,
    arrBufferToString,
};
