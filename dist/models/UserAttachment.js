"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const _1 = require("."); // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
class Attachment extends sequelize_1.Model {
}
Attachment.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    atc_resume: {
        type: sequelize_1.DataTypes.TEXT,
        defaultValue: ""
    },
    atc_portfolio: {
        type: sequelize_1.DataTypes.TEXT,
        defaultValue: ""
    },
    // timestamps
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    tableName: "attachment",
    sequelize: // Nama tabel di database
    _1.sequelize, // Instance Sequelize yang digunakan
});
exports.default = Attachment;
//# sourceMappingURL=UserAttachment.js.map