import { DataTypes, Model,CreationOptional } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda

class Post extends Model {
  declare id: CreationOptional<number>;
  declare title: string;
  declare link: string;
  declare company: string;
  declare location: string;
  declare post_date: string;
  declare tags: string;
  declare platform: string;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;
}

Post.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false
    },
    company: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    post_date: {
      type: DataTypes.STRING,
    },
    tags: {
      type: DataTypes.STRING,
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Lainnya..."
    },
  },
  {
    sequelize, // Instance Sequelize yang digunakan
  }
);

export default Post;
