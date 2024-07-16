import { DataTypes, Model,CreationOptional, HasManyAddAssociationMixin, HasManyHasAssociationMixin, HasManyRemoveAssociationsMixin, HasManyGetAssociationsMixin, HasOneCreateAssociationMixin, HasOneGetAssociationMixin, HasOneSetAssociationMixin } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
import Experience from "./UserExperience";
import Education from "./UserEducation";
import Attachment from "./UserAttachment";

class User extends Model {
  declare id: CreationOptional<number>;
  declare email: string;
  declare role: number;
  declare profile_picture: string;
  declare firstname: string;
  declare lastname: string;
  declare summary: string;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;

  // Mixin Education Has Many
  declare addEducation: HasManyAddAssociationMixin<Education, number>
  declare hasEducation: HasManyHasAssociationMixin<Education, number>
  declare removeEducation: HasManyRemoveAssociationsMixin<Education,number>
  declare getEducations: HasManyGetAssociationsMixin<Education>

  declare addExperience: HasManyAddAssociationMixin<Experience, number>
  declare hasExperience: HasManyHasAssociationMixin<Experience, number>
  declare removeExperience: HasManyRemoveAssociationsMixin<Experience,number>
  declare getExperiences: HasManyGetAssociationsMixin<Experience>

  declare createAttachments: HasOneCreateAssociationMixin<Attachment>
  declare getAttachments: HasOneGetAssociationMixin<Attachment>
  declare setAttachments: HasOneSetAssociationMixin<Attachment, number>
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
    firstname:{
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname:{
      type: DataTypes.STRING
    },
    summary:{
      type: DataTypes.TEXT
    },
    mobile: DataTypes.STRING,
    sex: DataTypes.STRING,
    current_status: DataTypes.TEXT,
    profile_viewers: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    active_search: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    domicile: DataTypes.STRING,
    date_of_birth: DataTypes.STRING,
  },
  {
    sequelize, // Instance Sequelize yang digunakan
  }
);

User.hasMany(Experience, {
  sourceKey: 'id',
  foreignKey: 'ownerId',
  as: 'experiences',
  constraints:false
});
User.hasMany(Education, {
  sourceKey: 'id',
  foreignKey: 'ownerId',
  as: 'educations',
  constraints:false
});
User.hasOne(Attachment, {
  sourceKey: 'id',
  foreignKey: 'ownerId',
  as: 'attachments',
  constraints:false
});

export default User;
