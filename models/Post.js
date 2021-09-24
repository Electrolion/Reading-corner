const { Model, DataTypes} = require('sequelize');
const sequelize = require('../config/connection');

// creates post model
class Post extends Model{}

// initiates post table
Post.init(
    {
        id : {
            type: DataTypes.INTEGER,
            allowNull: false,
            primary_key: true,
            autoIncrement: true
        },
        title:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        comment:{
            type: DataTypes.STRING,
            allowNull: false
        },
        user_id:{
            type: DataTypes.INTEGER,
            references: {
                model: "user",
                key: "id"
            }
        }
    },
    {
        sequelize,
        freezeTableName: true,
        underscored: true,
        modelName: "post"
    }
);

module.exports = Post;