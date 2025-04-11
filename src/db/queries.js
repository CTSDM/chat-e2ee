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

async function getGroupMembers(groupId) {
    const members = await prisma.groupMember.findMany({
        where: {
            groupId: groupId,
        },
        select: {
            User: {
                select: {
                    publicUsername: true,
                },
            },
        },
    });
    return members;
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

async function getGroupKey(groupId, userId) {
    const groupKey = await prisma.groupKey.findUnique({
        where: {
            groupId_userId: { groupId, userId },
        },
    });
    return groupKey;
}

async function createGroupMemberAndGroupKey(groupId, userId, key, iv, isFinalKey) {
    const [newGroupKey, newMember] = await prisma.$transaction([
        prisma.groupMember.create({
            data: {
                groupId: groupId,
                userId: userId,
            },
        }),
        prisma.groupKey.create({
            data: {
                groupId: groupId,
                userId: userId,
                key: key,
                iv: iv,
                finalKey: isFinalKey,
            },
        }),
    ]);
    return [newMember, newGroupKey];
}

async function createGroupMemberAndGroupKeyBatch(members, keys) {
    const [count, _] = await prisma.$transaction([
        prisma.groupMember.createMany({
            data: members,
        }),
        prisma.groupKey.createMany({
            data: keys,
        }),
    ]);
    return count;
}

async function getUserIdsByPublicUsername(usernamesArr) {
    const users = await prisma.user.findMany({
        where: {
            publicUsername: {
                in: usernamesArr,
                mode: "insensitive",
            },
        },
        select: {
            publicUsername: true,
            id: true,
        },
    });
    const usernameAndId = {};
    users.forEach((entry) => {
        usernameAndId[entry.publicUsername.toLowerCase()] = entry.id;
    });
    return usernameAndId;
}

export default {
    getUser,
    getGroup,
    getPublicKey,
    getUserByPublicUsername,
    getUserIdsByPublicUsername,
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
    getGroupKey,
    getGroupMembers,
    createGroupMemberAndGroupKey,
    createGroupMemberAndGroupKeyBatch,
};
