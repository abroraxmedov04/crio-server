import Profile from '../models/Profile.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

class ProfileController {
    async getProfile(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res
                    .status(401)
                    .json({ msg: 'Unauthorized, no token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id, {
                include: {
                    model: Profile,
                    as: 'profile'
                },
                attributes: { exclude: ['password'] }
            });
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }
            res.status(200).json({
                msg: 'Profile fetched successfully',
                user
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({
                msg: 'Error fetching profile',
                error: error.message
            });
        }
    }

    async updateProfile(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res
                    .status(401)
                    .json({ msg: 'Unauthorized, no token provided' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id, {
                include: { model: Profile, as: 'profile' }
            });

            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const {
                avatar,
                dateOfBirth,
                companyName,
                fullName,
                email,
                phoneNumber
            } = req.body;

            // Update profile data
            const profileData = {
                avatar: avatar || user.profile?.avatar,
                dateOfBirth: dateOfBirth || user.profile?.dateOfBirth,
                companyName: companyName || user.profile?.companyName
            };

            if (user.profile) {
                // Update existing profile
                await user.profile.update(profileData);
            } else {
                // Create a new profile if it doesn't exist
                await Profile.create({ ...profileData, userId: user.id });
            }

            // Update user data
            user.fullName = fullName || user.fullName;
            user.email = email || user.email;
            user.phoneNumber = phoneNumber || user.phoneNumber;

            await user.save();

            res.status(200).json({
                msg: 'Profile and user data updated successfully',
                user
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({
                msg: 'Error updating profile',
                error: error.message
            });
        }
    }
}

export default new ProfileController();
