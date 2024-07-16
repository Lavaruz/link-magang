import { DataTypes, Model,CreationOptional, ForeignKey, } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
import User from "./User";

class Socials extends Model {
  declare id: CreationOptional<number>;
  declare twitter: string;
  declare instagram: string;
  declare linkedin: string;
  declare behance: string;
  declare github: string;
  declare youtube: string;
  declare ownerId: ForeignKey<User['id']>;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;
}

Socials.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    twitter: {
        type: DataTypes.TEXT,
        defaultValue: ""
    },
    instagram: {
        type: DataTypes.TEXT,
        defaultValue: ""
    },
    linkedin: {
        type: DataTypes.TEXT,
        defaultValue: ""
    },
    behance: {
        type: DataTypes.TEXT,
        defaultValue: ""
    },
    github: {
        type: DataTypes.TEXT,
        defaultValue: ""
    },
    youtube: {
        type: DataTypes.TEXT,
        defaultValue: ""
    },

    // timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "socials", // Nama tabel di database
    sequelize, // Instance Sequelize yang digunakan
  }
);

export default Socials;