import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';
import User from './User.js';

class Profile extends Model {}

Profile.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        dateOfBirth: {
            type: DataTypes.STRING,
            allowNull: true
        },
        companyName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id'
            },
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'Profile',
        tableName: 'Profiles',
        timestamps: true
    }
);

User.hasOne(Profile, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    as: 'profile'
});

Profile.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

export default Profile;
