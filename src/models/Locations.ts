import { DataTypes, Model,CreationOptional, ForeignKey, } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda

class Locations extends Model {
  declare id: CreationOptional<number>;
  declare location: string;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;
}

Locations.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    location: {
        type: DataTypes.STRING,
        defaultValue: ""
    },

    // timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "locations", // Nama tabel di database
    sequelize, // Instance Sequelize yang digunakan
  }
);

export default Locations;