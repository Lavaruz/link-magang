"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const _1 = require("."); // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
class Education extends sequelize_1.Model {
}
Education.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    edu_type: sequelize_1.DataTypes.STRING,
    edu_program: sequelize_1.DataTypes.STRING,
    edu_faculty: sequelize_1.DataTypes.STRING,
    edu_institution: sequelize_1.DataTypes.STRING,
    edu_gpa: sequelize_1.DataTypes.STRING,
    edu_startdate: sequelize_1.DataTypes.STRING,
    edu_enddate: sequelize_1.DataTypes.STRING,
    edu_description: sequelize_1.DataTypes.TEXT,
    edu_location: sequelize_1.DataTypes.STRING,
    edu_status: sequelize_1.DataTypes.STRING,
    // timestamps
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: _1.sequelize, // Instance Sequelize yang digunakan
});
exports.default = Education;
//# sourceMappingURL=UserEducation.js.map