import { DataTypes, Model,CreationOptional } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
import Skills from "./Skills";

class Post extends Model {
  declare id: CreationOptional<number>;
  declare title: string;
  declare link: string;
  declare company: string;
  declare type: string;
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
      type: DataTypes.TEXT,
      allowNull: false
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "INTERNSHIP"
    },
    location: {
      type: DataTypes.STRING,
      defaultValue: ""
    },
    post_date: {
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


Post.belongsToMany(Skills,{
  as: "skills",
  sourceKey: "id",
  constraints: false,
  through: "PostSkill"
})
Skills.belongsToMany(Post,{
  as: "posts",
  sourceKey: "id",
  constraints: false,
  through: "PostSkill"
})

export default Post;
