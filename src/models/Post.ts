import { DataTypes, Model,CreationOptional, BelongsToManyAddAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManyRemoveAssociationMixin, BelongsToManySetAssociationsMixin } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
import Skills from "./Skills";
import User from "./User";

class Post extends Model {
  declare id: CreationOptional<number>;
  declare category: string;
  declare title: string;
  declare link: string;
  declare company: string;
  declare company_logo: string;
  declare type: string;
  declare location: string;
  declare post_date: string;
  declare end_date: string;
  declare tags: string;
  declare platform: string;
  declare overview: string;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;

  declare addSkills: BelongsToManyAddAssociationMixin<Skills, number>
  declare getSkills: BelongsToManyGetAssociationsMixin<Skills>
  declare removeSkills: BelongsToManyRemoveAssociationMixin<Skills,number>
  declare setSkills: BelongsToManySetAssociationsMixin<Skills,number>

  declare addSavedBy: BelongsToManyAddAssociationMixin<User, number>;
  declare getSavedBy: BelongsToManyGetAssociationsMixin<User>;
  declare removeSavedBy: BelongsToManyRemoveAssociationMixin<User, number>;
  declare setSavedBy: BelongsToManySetAssociationsMixin<User, number>;
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
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Internal"
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
    company_logo: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "internship"
    },
    location: {
      type: DataTypes.STRING,
      defaultValue: ""
    },
    post_date: {
      type: DataTypes.STRING,
    },
    end_date: {
      type: DataTypes.STRING,
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Lainnya..."
    },
    overview: {
      type: DataTypes.TEXT,
      allowNull: true,
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
