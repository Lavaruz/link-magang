import { DataTypes, Model,CreationOptional } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda

class User extends Model {
  declare id: CreationOptional<number>;
  declare email: string;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;
}

const USER_ROLE = 1
const ADMIN_ROLE = 2

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
      unique: true
    },
    role: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: USER_ROLE
    },
  },
  {
    sequelize, // Instance Sequelize yang digunakan
  }
);

export default User;
