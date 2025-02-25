import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getUser(param, id) {
    const user = await prisma.user.findUnique({
        where: {
            [param]: id,
        },
    });
    return user;
}

async function createUser(userData) {
    const user = await prisma.user.create({
        data: {
            privateUsername: userData.privateUsername,
            publicUsername: userData.publicUsername,
            password: userData.password,
            privateKeyEncrypted: userData.privateKeyEncrypted,
            publicKey: userData.publicKey,
            salt: userData.salt,
            iv: userData.iv,
        },
    });
    return user;
}

async function createToken(tokenString, userId) {
    const token = await prisma.token.create({ data: { id: tokenString, user_id: userId } });
    return token;
}

export default { getUser, createUser, createToken };
