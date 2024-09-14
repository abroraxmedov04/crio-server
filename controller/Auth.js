import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

class Auth {
    async registration(req, res) {
        try {
            const { fullName, email, phoneNumber, password, city, additional } =
                req.body;
            if (!fullName || !email || !phoneNumber || !password) {
                return res.status(400).json({ msg: 'Missing required fields' });
            }
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ msg: 'User already exists' });
            }
            const hashPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({
                fullName,
                email,
                phoneNumber,
                password: hashPassword,
                city,
                additional
            });
            const { password: _, ...user } = newUser.toJSON();
            const token = jwt.sign(
                { id: newUser.id, email: newUser.email, phoneNumber },
                process.env.JWT_SECRET,
                { expiresIn: '365d' }
            );
            res.status(201).json({
                msg: 'User added successfully',
                user,
                token
            });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({
                msg: 'Error creating user',
                error: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { email, phoneNumber, password } = req.body;
            if (!password || (!email && !phoneNumber)) {
                return res
                    .status(400)
                    .json({ msg: 'Missing password or email/phone number' });
            }
            let user;
            if (email) {
                user = await User.findOne({ where: { email } });
            } else if (phoneNumber) {
                user = await User.findOne({ where: { phoneNumber } });
            }
            if (!user) {
                return res
                    .status(401)
                    .json({ msg: 'Invalid email/phone number or password' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ msg: 'Invalid email/phone number or password' });
            }
            const { password: _, ...userData } = user.toJSON();
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    phoneNumber: user.phoneNumber
                },
                process.env.JWT_SECRET,
                { expiresIn: '365d' }
            );
            res.status(200).json({
                msg: 'Login successful',
                user: userData,
                token
            });
        } catch (error) {
            console.error('Error logging in user:', error);
            res.status(500).json({
                msg: 'Error logging in user',
                error: error.message
            });
        }
    }

    async resetPasswordRequest(req, res) {
        try {
            const { email, phoneNumber } = req.body;
            if (!email && !phoneNumber) {
                return res
                    .status(400)
                    .json({ msg: 'Either email or phone number is required' });
            }

            let user;
            if (email) {
                user = await User.findOne({ where: { email } });
            } else if (phoneNumber) {
                user = await User.findOne({ where: { phoneNumber } });
            }

            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const resetToken = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                {
                    expiresIn: '1h'
                }
            );

            if (email) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: 'Password Reset Request',
                    text: `You requested a password reset. Click the following link to reset your password: ${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`
                };

                await transporter.sendMail(mailOptions);
                res.status(200).json({
                    msg: 'Password reset email sent successfully'
                });
            }
        } catch (error) {
            console.error('Error sending reset password message:', error);
            res.status(500).json({
                msg: 'Error sending reset password message',
                error: error.message
            });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return res
                    .status(400)
                    .json({ msg: 'Missing token or new password' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);
            if (!user) {
                return res.status(404).json({ msg: 'Invalid token' });
            }

            const hashPassword = await bcrypt.hash(newPassword, 10);

            user.password = hashPassword;
            await user.save();

            res.status(200).json({
                msg: 'Password has been reset successfully'
            });
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({
                msg: 'Error resetting password',
                error: error.message
            });
        }
    }
}

export default new Auth();
