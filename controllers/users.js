let userModel = require("../bin/schemas/users");
let bcrypt = require('bcrypt');
let mongoose = require('mongoose');

// Fallback in-memory store when MongoDB is not available
let memoryUsers = [];

function isDbConnected() {
    return mongoose.connection && mongoose.connection.readyState === 1;
}

function normalizeUser(user) {
    if (!user) return null;
    // Mongoose docs sometimes return lean objects; unify
    return user.toObject ? user.toObject() : user;
}

module.exports = {
    CreateAnUser: async function (username, password, email, role,
        fullName, avatarUrl, status, loginCount
    ) {
        let hashedPassword = await bcrypt.hash(password, 10);

        if (isDbConnected()) {
            let newItem = new userModel({
                username: username,
                password: hashedPassword,
                email: email,
                fullName: fullName,
                avatarUrl: avatarUrl,
                status: status,
                role: role,
                loginCount: loginCount
            });
            await newItem.save();
            return newItem;
        }

        // Fallback: store in memory
        let newItem = {
            _id: new mongoose.Types.ObjectId(),
            username,
            password: hashedPassword,
            email,
            fullName,
            avatarUrl,
            status,
            role,
            loginCount,
            lockTime: 0,
            isDeleted: false
        };
        memoryUsers.push(newItem);
        return newItem;
    },

    GetAllUser: async function () {
        if (isDbConnected()) {
            let users = await userModel.find({ isDeleted: false })
            return users;
        }
        return memoryUsers.filter(u => !u.isDeleted);
    },
    GetAnUserByUsername: async function (username) {
        if (isDbConnected()) {
            let user = await userModel.findOne({
                isDeleted: false,
                username: username
            })
            return user;
        }
        return memoryUsers.find(u => !u.isDeleted && u.username === username);
    },
    GetAnUserById: async function (id) {
        if (isDbConnected()) {
            let user = await userModel.findOne({
                isDeleted: false,
                _id: id
            })
            return user;
        }
        return memoryUsers.find(u => !u.isDeleted && u._id.toString() === id.toString());
    },
    UpdatePassword: async function (id, newPassword) {
        let hashedPassword = await bcrypt.hash(newPassword, 10);
        if (isDbConnected()) {
            let user = await userModel.findById(id);
            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }
            user.password = hashedPassword;
            await user.save();
            return user;
        }
        let user = memoryUsers.find(u => u._id.toString() === id.toString());
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }
        user.password = hashedPassword;
        return user;
    }

}