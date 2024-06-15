"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const _1 = require("."); // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
class User extends sequelize_1.Model {
}
const ADMIN_ROLE = 1;
const USER_ROLE = 2;
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: USER_ROLE
    },
    profile_picture: {
        type: sequelize_1.DataTypes.TEXT,
    },
    name: {
        type: sequelize_1.DataTypes.STRING
    }
}, {
    sequelize: _1.sequelize, // Instance Sequelize yang digunakan
});
exports.default = User;
//# sourceMappingURL=User.js.map