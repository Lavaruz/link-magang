"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const _1 = require("."); // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
const UserExperience_1 = __importDefault(require("./UserExperience"));
const UserEducation_1 = __importDefault(require("./UserEducation"));
const UserAttachment_1 = __importDefault(require("./UserAttachment"));
const UserSocial_1 = __importDefault(require("./UserSocial"));
const Skills_1 = __importDefault(require("./Skills"));
const UserConfig_1 = __importDefault(require("./UserConfig"));
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
    headline: {
        type: sequelize_1.DataTypes.TEXT,
        defaultValue: ""
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
    firstname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    lastname: {
        type: sequelize_1.DataTypes.STRING
    },
    summary: {
        type: sequelize_1.DataTypes.TEXT
    },
    mobile: sequelize_1.DataTypes.STRING,
    sex: sequelize_1.DataTypes.STRING,
    current_status: sequelize_1.DataTypes.TEXT,
    profile_viewers: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0
    },
    active_search: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    domicile: sequelize_1.DataTypes.STRING,
    date_of_birth: sequelize_1.DataTypes.STRING,
    work_pref_status: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: "WFO"
    },
    salary: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: "0"
    },
}, {
    sequelize: _1.sequelize, // Instance Sequelize yang digunakan
});
User.hasMany(UserExperience_1.default, {
    sourceKey: 'id',
    foreignKey: 'ownerId',
    as: 'experiences',
    constraints: false
});
User.hasMany(UserEducation_1.default, {
    sourceKey: 'id',
    foreignKey: 'ownerId',
    as: 'educations',
    constraints: false
});
User.hasOne(UserAttachment_1.default, {
    sourceKey: 'id',
    foreignKey: 'ownerId',
    as: 'attachments',
    constraints: false
});
User.hasOne(UserSocial_1.default, {
    sourceKey: 'id',
    foreignKey: 'ownerId',
    as: 'socials',
    constraints: false
});
User.hasOne(UserConfig_1.default, {
    sourceKey: 'id',
    foreignKey: 'ownerId',
    as: 'config',
    constraints: false
});
User.belongsToMany(Skills_1.default, {
    as: "skills",
    sourceKey: "id",
    constraints: false,
    through: "UserSkill"
});
Skills_1.default.belongsToMany(User, {
    as: "users",
    sourceKey: "id",
    constraints: false,
    through: "UserSkill"
});
exports.default = User;
//# sourceMappingURL=User.js.map