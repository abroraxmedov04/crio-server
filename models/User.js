import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';

class User extends Model {}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 255]
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [10, 15]
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [6, 255]
            }
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'No address provided'
        },
        additional: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        timestamps: true
    }
);

export default User;
