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

async function deleteDirectMessage(publicUsername) {
    await prisma.message.deleteMany({
        where: {
            receiverPublicUsername: publicUsername,
        },
    });
}

async function getUserByPublicUsername(username) {
    const user =
        await prisma.$queryRaw`SELECT * FROM users WHERE LOWER(users."publicUsername") = ${username.toLowerCase()};`;
    return user[0];
}

async function getDirectMessages(userId) {
    const messages = await prisma.directMessage.findMany({
        where: {
            OR: [{ receivedByUserId: userId }, { sentByUserId: userId }],
        },
        orderBy: {
            createdAt: "asc",
        },
    });
    return messages;
}

async function updateDirectMessageReadStatus(id) {
    const statusUpdate = await prisma.directMessage.update({
        where: {
            id: id,
        },
        data: {
            readStatus: true,
        },
        select: {
            readStatus: true,
        },
    });
    return statusUpdate;
}

async function getGroup(id) {
    const group = await prisma.group.findUnique({
        where: {
            id: id,
        },
    });
    return group;
}

async function createGroup(groupId, groupName, userId, date) {
    const group = await prisma.group.create({
        data: {
            id: groupId,
            name: groupName,
            createdByUserId: userId,
            createdAt: new Date(date),
        },
    });
    return group;
}

async function createGroupMember(groupId, userId) {
    const member = await prisma.groupMember.create({
        data: {
            groupId: groupId,
            userId: userId,
        },
    });
    return member;
}

async function createGroupKey(groupId, userId, key, iv, keyStatus) {
    const entry = await prisma.groupKey.create({
        data: {
            groupId: groupId,
            userId: userId,
            key: key,
            iv: iv,
            finalKey: keyStatus,
        },
    });
    return entry;
}

export default {
    getUser,
    getGroup,
    getPublicKey,
    getUserByPublicUsername,
    getToken,
    createUser,
    createToken,
    deleteToken,
    createDirectMessage,
    deleteDirectMessage,
    getDirectMessages,
    updateDirectMessageReadStatus,
    createGroup,
    createGroupMember,
    createGroupKey,
};
