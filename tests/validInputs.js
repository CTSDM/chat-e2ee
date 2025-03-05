const passwords = {
    valid: ["LK_123ppp", "PPPP_123", "000_ooo_OOO"],
    invalid: ["", "1", "2", "laa_123"],
};

const randomArrays = [
    Array.from({ length: 25 }, () => Math.floor(Math.random() * 255)),
    Array.from({ length: 25 }, () => Math.floor(Math.random() * 255)),
    Array.from({ length: 25 }, () => Math.floor(Math.random() * 255)),
];

const arrData = [
    {
        data: [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
        ],
        result: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    {
        data: [[1, 2, 3], [4, 5, 6], randomArrays[0]],
        result: [1, 2, 3, 4, 5, 6, ...randomArrays[0]],
    },
    {
        data: [randomArrays[0], randomArrays[1], randomArrays[2]],
        result: [...randomArrays[0], ...randomArrays[1], ...randomArrays[2]],
    },
];

export { passwords, arrData };
