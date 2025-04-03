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
    const token = await prisma.token.create({ data: { id: tokenString, userId: userId } });
    return token;
}

async function getToken(tokenString) {
    const token = await prisma.token.findUnique({
        where: {
            id: tokenString,
        },
    });
    return token;
}

async function getPublicKey(publicUsername) {
    const queryResult = await prisma.$queryRaw`
        SELECT users."publicKey", users.salt, users."publicUsername" FROM users
        WHERE LOWER(users."publicUsername") = ${publicUsername};`;

    return queryResult[0];
}

async function deleteToken(tokenString) {
    const token = await prisma.token.delete({ where: { id: tokenString } });
    return token;
}

async function createDirectMessage(id, sender, receiver, date, iv, content) {
    const message = await prisma.directMessage.create({
        data: {
            id: id,
            sentByUserId: sender,
            receivedByUserId: receiver,
            createdAt: new Date(date),
            iv: iv,
            contentEncrypted: content,
        },
    });
    return message;
}

async function getDirectMessages(publicUsername) {
    const messages = await prisma.message.findMany({
        where: {
            receiverPublicUsername: publicUsername,
        },
    });
    if (messages.length === 0) {
        return null;
    }
    return messages;
}

async function deleteDirectMessage(publicUsername) {
    await prisma.message.deleteMany({
        where: {
            receiverPublicUsername: publicUsername,
        },
    });
}

async function createKeyGroup(username, groupID, iv, key) {
    return null;
}

async function getUserByPublicUsername(username) {
    const user =
        await prisma.$queryRaw`SELECT * FROM users WHERE LOWER(users."publicUsername") = ${username};`;
    return user[0];
}

export default {
    getUser,
    getPublicKey,
    getUserByPublicUsername,
    getToken,
    createUser,
    createToken,
    deleteToken,
    createDirectMessage,
    deleteDirectMessage,
    getDirectMessages,
    createKeyGroup,
};
