const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (userData) => {
    const { name, email, password } = userData;

    // Check if user exists
    const existingUser = await prisma.authorizedUser.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw { status: 400, message: 'User already exists' };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.authorizedUser.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};

const loginUser = async ({ email, password }) => {
    // Find user
    const user = await prisma.authorizedUser.findUnique({
        where: { email }
    });

    if (!user) {
        throw { status: 401, message: 'Invalid credentials' };
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw { status: 401, message: 'Invalid credentials' };
    }

    // Generate Token (no role, no departmentId)
    const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
};

module.exports = {
    registerUser,
    loginUser
};
