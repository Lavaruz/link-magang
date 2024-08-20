"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const _1 = require("."); // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
class Socials extends sequelize_1.Model {
}
Socials.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    twitter: {
        type: sequelize_1.DataTypes.TEXT,
        defaultValue: ""
    },
    instagram: {
        type: sequelize_1.DataTypes.TEXT,
        defaultValue: ""
    },
    linkedin: {
        type: sequelize_1.DataTypes.TEXT,
        defaultValue: ""
    },
    behance: {
        type: sequelize_1.DataTypes.TEXT,
        defaultValue: ""
    },
    github: {
        type: sequelize_1.DataTypes.TEXT,
        defaultValue: ""
    },
    youtube: {
        type: sequelize_1.DataTypes.TEXT,
        defaultValue: ""
    },
    // timestamps
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    tableName: "socials",
    sequelize: // Nama tabel di database
    _1.sequelize, // Instance Sequelize yang digunakan
});
exports.default = Socials;
//# sourceMappingURL=UserSocial.js.map