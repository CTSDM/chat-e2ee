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
            publicUsernameOriginalCase: userData.publicUsernameOriginalCase,
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

async function getToken(tokenString) {
    const token = await prisma.token.findUnique({
        where: {
            id: tokenString,
        },
    });
    return token;
}

async function getPublicKey(publicUsername) {
    const publicKey = await prisma.user.findUnique({
        where: {
            publicUsername: publicUsername,
        },
        select: {
            publicKey: true,
            salt: true,
            publicUsername: true,
            publicUsernameOriginalCase: true,
        },
    });

    return publicKey;
}

async function deleteToken(tokenString) {
    const token = await prisma.token.delete({ where: { id: tokenString } });
    return token;
}

async function createMessage(messageObject) {
    const message = await prisma.message.create({
        data: {
            receiverPublicUsername: messageObject.receiver,
            senderPublicUsername: messageObject.sender,
            content: messageObject.content,
            date: messageObject.date,
            flagByte: messageObject.flagByte,
        },
    });
    return message;
}

async function getMessages(publicUsername) {
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

async function deleteMessages(publicUsername) {
    await prisma.message.deleteMany({
        where: {
            receiverPublicUsername: publicUsername,
        },
    });
}

export default {
    getUser,
    getPublicKey,
    getToken,
    createUser,
    createToken,
    deleteToken,
    createMessage,
    deleteMessages,
    getMessages,
};
