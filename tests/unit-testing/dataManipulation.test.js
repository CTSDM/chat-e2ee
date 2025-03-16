import dataManipulation from "../../src/utils/dataManipulation.js";
import { describe, it, expect } from "@jest/globals";
import { arrData } from "../validInputs.js";

describe("The function concatUint8Arr", () => {
    it("should work for a valid set of input arrays", () => {
        arrData.forEach((obj) => {
            const arrUint8Arr = [];
            obj.data.forEach((arr) => {
                arrUint8Arr.push(new Uint8Array(arr));
            });
            const arrResult = dataManipulation.concatUint8Arr(arrUint8Arr);
            let correct = true;
            for (let i = 0; i < arrResult.length; ++i) {
                if (arrResult[i] !== obj.result[i]) {
                    correct = false;
                    break;
                }
            }
            expect(correct).toBeTruthy();
        });
    });

    it("should throw an error for an empty array", () => {
        const arrUint8Arr = [];
        expect(() => dataManipulation.concatUint8Arr(arrUint8Arr)).toThrow(
            "Array length must be greater than 1",
        );
    });

    it("should throw an error for an array not fully composed of Uint8Array", () => {
        const arrUint8Arr = [new Uint8Array(10), [1, 2, 3]];
        expect(() => dataManipulation.concatUint8Arr(arrUint8Arr)).toThrow(
            "The array is not fully composed of Uint8Array",
        );
    });

    it("should work correctly for real inputs", () => {
        const arrSimple = [1, 2, 3];
        const arrInt = dataManipulation.intToUint8Array(404, 2);
        const arrUint8Arr = [arrInt, new Uint8Array(arrSimple)];
        const arrConcat = dataManipulation.concatUint8Arr(arrUint8Arr);
        arrConcat;
        const arrConcatResult = [148, 1, 1, 2, 3];
        arrConcat.forEach((value, index) => {
            expect(value).toBe(arrConcatResult[index]);
        });
    });
});
