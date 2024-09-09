import express from 'express';
import dontenv from 'dotenv';
import cors from 'cors';
import sequelize from './db.js';
import Auth from './controller/Auth.js';
import ProfileController from './controller/ProfileController.js';

dontenv.config();

const PORT = process.env.PORT || 8000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.json({ msg: `server works fine on port ${PORT}` });
});

// login register
app.post('/api/users/regist', Auth.registration);
app.post('/api/users/login', Auth.login);
app.post('/api/users/reset', Auth.resetPasswordRequest);
app.post('/api/users/reset-password', Auth.resetPassword);

// profile
app.get('/api/users/profile-get', ProfileController.getProfile);
app.post('/api/users/profile-edit', ProfileController.updateProfile);

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync();
        console.log('All tables have been synchronized.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};

startServer();
