import { DataTypes, Model,CreationOptional, ForeignKey, } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
import User from "./User";

class Config extends Model {
  declare id: CreationOptional<number>;
  declare show_sensitive_data: boolean;
  declare ownerId: ForeignKey<User['id']>;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;
}

Config.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    show_sensitive_data: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    // timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "user-config", // Nama tabel di database
    sequelize, // Instance Sequelize yang digunakan
  }
);

export default Config;