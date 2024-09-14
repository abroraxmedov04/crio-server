import express from 'express';
import dontenv from 'dotenv';
import cors from 'cors';
import sequelize from './db.js';
import bodyParser from 'body-parser';
import Auth from './controller/Auth.js';
import ProfileController from './controller/ProfileController.js';
import upload from './upload.js';

dontenv.config();

const PORT = process.env.PORT || 8000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));


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


// imgae upload logic 
app.post("/api/users/upload-image", upload.single('avatar'), ProfileController.uploadAvatar)

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
