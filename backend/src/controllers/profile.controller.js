const User = require('../models/User');
const UserProfile = require('../models/UserProfile');

const toSafeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    email_verified: user.email_verified || false,
    profile_completed: user.profile_completed || false,
    pin_set: user.pin_set || false,
    kyc_status: user.kyc_status || 'pending',
    balance: user.balance,
    account_number: user.account_number,
    created_at: user.created_at,
    updated_at: user.updated_at,
    profile_picture: user.profile_picture || null
});

exports.completeProfile = async (req, res) => {
    const dateOfBirth = req.body.dateOfBirth || req.body.date_of_birth;
    const address = req.body.address;
    const nationalId = req.body.nationalId || req.body.national_id;

    try {
        if (!dateOfBirth || !address || !nationalId) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        const dobDate = new Date(dateOfBirth);
        if (Number.isNaN(dobDate.getTime())) {
            return res.status(400).json({ msg: 'Invalid date of birth' });
        }

        const today = new Date();
        const age = today.getFullYear() - dobDate.getFullYear();
        if (age < 18 || age > 120) {
            return res.status(400).json({ msg: 'You must be between 18 and 120 years old' });
        }

        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const profile = await UserProfile.upsert(userId, {
            dateOfBirth,
            address,
            nationalId
        });

        const updateData = { profile_completed: true };
        if (req.body.profilePicture || req.body.profile_picture) {
            updateData.profile_picture = req.body.profilePicture || req.body.profile_picture;
        }
        await User.update(userId, updateData);

        const updatedUser = await User.findById(userId);

        res.json({
            msg: 'Profile saved successfully',
            user: toSafeUser(updatedUser),
            profile: {
                date_of_birth: profile.date_of_birth,
                address: profile.address,
                national_id: profile.national_id,
                created_at: profile.created_at,
                updated_at: profile.updated_at
            }
        });
    } catch (err) {
        console.error('Complete profile error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const profile = await UserProfile.findByUserId(userId);

        res.json({
            user: toSafeUser(user),
            profile: profile ? {
                date_of_birth: profile.date_of_birth,
                address: profile.address,
                national_id: profile.national_id,
                created_at: profile.created_at,
                updated_at: profile.updated_at
            } : null
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.updateIdentification = async (req, res) => {
    const { nationalId, dateOfBirth, address, idType, idNumber, idExpiry } = req.body;
    
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Validate required fields
        if (!nationalId || !dateOfBirth || !address) {
            return res.status(400).json({ msg: 'National ID, date of birth, and address are required' });
        }

        // Validate date
        const dobDate = new Date(dateOfBirth);
        if (Number.isNaN(dobDate.getTime())) {
            return res.status(400).json({ msg: 'Invalid date of birth' });
        }

        const today = new Date();
        const age = today.getFullYear() - dobDate.getFullYear();
        if (age < 18 || age > 120) {
            return res.status(400).json({ msg: 'You must be between 18 and 120 years old' });
        }

        // Validate ID expiry if provided
        if (idExpiry) {
            const expiryDate = new Date(idExpiry);
            if (Number.isNaN(expiryDate.getTime())) {
                return res.status(400).json({ msg: 'Invalid ID expiry date' });
            }
            if (expiryDate <= today) {
                return res.status(400).json({ msg: 'ID cannot be expired' });
            }
        }

        const profile = await UserProfile.upsert(userId, {
            dateOfBirth,
            address,
            nationalId,
            idType: idType || 'national_id',
            idNumber: idNumber || nationalId,
            idExpiry: idExpiry || null
        });

        const updateData = { profile_completed: true };
        if (req.body.profilePicture || req.body.profile_picture) {
            updateData.profile_picture = req.body.profilePicture || req.body.profile_picture;
        }
        await User.update(userId, updateData);
        const updatedUser = await User.findById(userId);

        res.json({
            msg: 'Identification updated successfully',
            user: toSafeUser(updatedUser),
            profile: {
                date_of_birth: profile.date_of_birth,
                address: profile.address,
                national_id: profile.national_id,
                id_type: profile.id_type,
                id_number: profile.id_number,
                id_expiry: profile.id_expiry,
                created_at: profile.created_at,
                updated_at: profile.updated_at
            }
        });
    } catch (err) {
        console.error('Update identification error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getIdentification = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const profile = await UserProfile.findByUserId(userId);

        res.json({
            user: toSafeUser(user),
            profile: profile ? {
                date_of_birth: profile.date_of_birth,
                address: profile.address,
                national_id: profile.national_id,
                id_type: profile.id_type,
                id_number: profile.id_number,
                id_expiry: profile.id_expiry,
                created_at: profile.created_at,
                updated_at: profile.updated_at
            } : null
        });
    } catch (err) {
        console.error('Get identification error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        await User.delete(userId);

        res.json({ msg: 'Account deleted successfully' });
    } catch (err) {
        console.error('Delete profile error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};
