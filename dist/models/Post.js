"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const _1 = require("."); // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
class Post extends sequelize_1.Model {
}
Post.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    link: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    company: {
        type: sequelize_1.DataTypes.STRING,
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
    },
    post_date: {
        type: sequelize_1.DataTypes.STRING,
    },
    tags: {
        type: sequelize_1.DataTypes.STRING,
    },
    platform: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "Lainnya..."
    },
}, {
    sequelize: _1.sequelize, // Instance Sequelize yang digunakan
});
exports.default = Post;
//# sourceMappingURL=Post.js.map