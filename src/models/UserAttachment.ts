import { DataTypes, Model,CreationOptional, ForeignKey, } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
import User from "./User";

class Attachment extends Model {
  declare id: CreationOptional<number>;
  declare atc_resume: string;
  declare atc_portfolio: string;
  declare ownerId: ForeignKey<User['id']>;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;
}

Attachment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    atc_resume: {
        type: DataTypes.TEXT,
        defaultValue: ""
    },
    atc_portfolio: {
        type: DataTypes.TEXT,
        defaultValue: ""
    },

    // timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "attachment", // Nama tabel di database
    sequelize, // Instance Sequelize yang digunakan
  }
);

export default Attachment;