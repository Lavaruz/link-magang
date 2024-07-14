import { DataTypes, Model,CreationOptional, ForeignKey, } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
import User from "./User";

class Experience extends Model {
  declare id: CreationOptional<number>;
  declare exp_position: string;
  declare exp_type: string;
  declare exp_orgname: string;
  declare exp_time: string;
  declare exp_startdate: string;
  declare exp_enddate: string;
  declare exp_description: string;
  declare exp_status: string;
  declare exp_location: string;
  declare ownerId: ForeignKey<User['id']>;
  
  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;
}

Experience.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    exp_position: DataTypes.STRING,
    exp_type: DataTypes.STRING,
    exp_orgname: DataTypes.STRING,
    exp_time: DataTypes.STRING,
    exp_startdate: DataTypes.STRING,
    exp_enddate: DataTypes.STRING,
    exp_description: DataTypes.TEXT,
    exp_location: DataTypes.STRING,
    exp_status: DataTypes.STRING,

    // timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize, // Instance Sequelize yang digunakan
  }
);

// Experience.belongsTo(Seeker)

export default Experience;