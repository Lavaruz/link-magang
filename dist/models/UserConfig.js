"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const _1 = require("."); // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
class Config extends sequelize_1.Model {
}
Config.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    show_birthday: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    show_phone: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    // timestamps
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    tableName: "user-config",
    sequelize: // Nama tabel di database
    _1.sequelize, // Instance Sequelize yang digunakan
});
exports.default = Config;
//# sourceMappingURL=UserConfig.js.map