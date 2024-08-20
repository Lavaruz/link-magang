"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const _1 = require("."); // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
class Experience extends sequelize_1.Model {
}
Experience.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    exp_position: sequelize_1.DataTypes.STRING,
    exp_type: sequelize_1.DataTypes.STRING,
    exp_orgname: sequelize_1.DataTypes.STRING,
    exp_time: sequelize_1.DataTypes.STRING,
    exp_startdate: sequelize_1.DataTypes.STRING,
    exp_enddate: sequelize_1.DataTypes.STRING,
    exp_description: sequelize_1.DataTypes.TEXT,
    exp_location: sequelize_1.DataTypes.STRING,
    exp_status: sequelize_1.DataTypes.STRING,
    // timestamps
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: _1.sequelize, // Instance Sequelize yang digunakan
});
// Experience.belongsTo(Seeker)
exports.default = Experience;
//# sourceMappingURL=UserExperience.js.map