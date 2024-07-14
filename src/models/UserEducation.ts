import { DataTypes, Model,CreationOptional, ForeignKey, } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
import User from "./User";

class Education extends Model {
  declare id: CreationOptional<number>;
  declare edu_type: string;
  declare edu_program: string;
  declare edu_faculty: string;
  declare edu_institution: string;
  declare edu_gpa: string;
  declare edu_startdate: string;
  declare edu_enddate: string;
  declare edu_description: string;
  declare edu_location: string;
  declare edu_status: string;
  declare ownerId: ForeignKey<User['id']>;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;
}

Education.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    edu_type: DataTypes.STRING,
    edu_program: DataTypes.STRING,
    edu_faculty: DataTypes.STRING,
    edu_institution: DataTypes.STRING,
    edu_gpa: DataTypes.STRING,
    edu_startdate: DataTypes.STRING,
    edu_enddate: DataTypes.STRING,
    edu_description: DataTypes.TEXT,
    edu_location: DataTypes.STRING,
    edu_status: DataTypes.STRING,

    // timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize, // Instance Sequelize yang digunakan
  }
);

export default Education;