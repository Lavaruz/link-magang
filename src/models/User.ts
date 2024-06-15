import { DataTypes, Model,CreationOptional } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda

class User extends Model {
  declare id: CreationOptional<number>;
  declare email: string;
  declare role: number;
  declare profile_picture: string;
  declare name: string;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;
}

const ADMIN_ROLE = 1
const USER_ROLE = 2

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.INTEGER,
      defaultValue: USER_ROLE
    },
    profile_picture: {
      type: DataTypes.TEXT,
    },
    name:{
      type: DataTypes.STRING
    }
  },
  {
    sequelize, // Instance Sequelize yang digunakan
  }
);

export default User;
