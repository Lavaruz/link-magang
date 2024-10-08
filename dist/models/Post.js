"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const _1 = require("."); // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
const Skills_1 = __importDefault(require("./Skills"));
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
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "Internal"
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
        allowNull: false
    },
    company_logo: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: "internship"
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: ""
    },
    post_date: {
        type: sequelize_1.DataTypes.STRING,
    },
    end_date: {
        type: sequelize_1.DataTypes.STRING,
    },
    platform: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: "Lainnya..."
    },
    overview: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: _1.sequelize, // Instance Sequelize yang digunakan
});
Post.belongsToMany(Skills_1.default, {
    as: "skills",
    sourceKey: "id",
    constraints: false,
    through: "PostSkill"
});
Skills_1.default.belongsToMany(Post, {
    as: "posts",
    sourceKey: "id",
    constraints: false,
    through: "PostSkill"
});
exports.default = Post;
//# sourceMappingURL=Post.js.map