import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const accessToken = generateToken(user._id);
      res.json({
        status: 'success',
        message: 'Login successful',
        data: {
          access_token: accessToken,
          refresh_token: accessToken, // Simplification for now
          token_type: 'Bearer',
          expires_in: 30 * 24 * 60 * 60, // 30 days in seconds
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.createdAt,
          },
        },
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const createDefaultAdmin = async (req, res) => {
  try {
    const adminExists = await User.findOne({ email: 'admin@hinguland.com' });

    if (adminExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin already exists' 
      });
    }

    const user = await User.create({
      name: 'Admin',
      email: 'admin@hinguland.com',
      password: 'password123',
      role: 'admin',
    });

    if (user) {
      const accessToken = generateToken(user._id);
      res.status(201).json({
        status: 'success',
        message: 'Admin created successfully',
        data: {
          access_token: accessToken,
          refresh_token: accessToken,
          token_type: 'Bearer',
          expires_in: 30 * 24 * 60 * 60,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: 'admin',
            created_at: user.createdAt,
          },
        },
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid user data' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.createdAt,
        }
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

