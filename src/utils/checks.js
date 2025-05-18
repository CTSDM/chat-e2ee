import { strict as assert } from "node:assert";

function number(num) {
    assert.strictEqual(typeof num, "number");
    return true;
}

function uuid(id) {
    assert.strictEqual(typeof id, "string");
    assert.strictEqual(id.length, 36);
    assert.strictEqual(checkUUIDstructure(id), true);
    return true;
}

function arrayBuffer(itemToCheck, len) {
    assert.strictEqual(itemToCheck.__proto__, new ArrayBuffer().__proto__);
    if (len) {
        assert.strictEqual(typeof len, "number");
        assert.strictEqual(itemToCheck.byteLength, len);
    } else {
        assert.strictEqual(itemToCheck.byteLength > 0, true);
    }
    return true;
}

function string(name, limits) {
    assert.strictEqual(typeof name, "string");
    assert.strictEqual(name.length > 0, true);
    if (limits) {
        assert(limits.lower || limits.upper, true);
        if (limits.upper) {
            number(limits.upper);
            assert.strictEqual(name.length <= limits.upper, true);
        }
        if (limits.lower) {
            number(limits.lower);
            assert.strictEqual(name.length >= limits.lower, true);
        }
    }
    return true;
}

function date(dateInt, limits) {
    number(dateInt);
    assert.strictEqual(!isNaN(new Date(dateInt).getTime()), true);
    if (limits) {
        assert(limits.lower || limits.upper, true);
        if (limits.upper) {
            number(limits.upper);
            assert.strictEqual(!isNaN(new Date(limits.upper).getTime()), true);
            assert.strictEqual(new Date(dateInt) < new Date(limits.upper), true);
        }
        if (limits.lower) {
            number(limits.lower);
            assert.strictEqual(!isNaN(new Date(limits.lower).getTime()), true);
            assert.strictEqual(new Date(dateInt) > new Date(limits.lower), true);
        }
    }
    return true;
}

function checkUUIDstructure(id) {
    // id has already 36 length
    // id is already of type string
    // we split the string by the dashes, check the length of each part
    // each part should only be composed of number or/and letter
    const Regex = /^[a-z0-9]+$/i;
    const RegexVer = /^[a-b8-9]/i;
    const parts = id.split("-");
    assert.strictEqual(parts.length, 5);
    const partsLength = [8, 4, 4, 4, 12];
    for (let i = 0; i < partsLength.length; ++i) {
        assert.strictEqual(parts[i].length, partsLength[i]);
        assert.strictEqual(Regex.test(parts[i]), true);
        if (i === 2) {
            assert.strictEqual(+parts[i][0], 4);
        }
        if (i === 3) {
            assert.strictEqual(RegexVer.test(parts[i]), true);
        }
    }
    return true;
}

export default { arrayBuffer, date, number, string, uuid };
