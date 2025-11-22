import express from 'express';
import User from '../Models/User.js';

const router = express.Router();

// Only this email can be admin
const ADMIN_EMAIL = 'naharamina68@gmail.com';

// Middleware to check if email is authorized for admin role
const isAuthorizedAdmin = (email) => {
  return email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

// Get All users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get user by uid
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ message: 'UID is required' });
    }
    const user = await User.findOne({ uid: uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// Create or update user
router.post('/', async (req, res) => {
  const { uid, email, displayName } = req.body;
  if (!uid || !email || !displayName) {
    return res
      .status(400)
      .json({ message: 'UID, email, and displayName are required' });
  }
  try {
    const existingUser = await User.findOne({ uid: uid });
    if (existingUser) {
      res.status(200).json({
        error: false,
        message: 'User already exists',
        user: existingUser,
      });
      return;
    }
    
    // Automatically set admin role for authorized email
    const role = isAuthorizedAdmin(email) ? 'admin' : 'user';
    
    const newUser = new User({ uid, email: email.toLowerCase(), displayName, role });
    await newUser.save();
    res
      .status(201)
      .json({ error: false, message: 'User created', user: newUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// Update user by email (admin endpoint)
router.put('/email/:email', async (req, res) => {
  const { email } = req.params;
  const { role, displayName } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent unauthorized admin role assignment
    if (role === 'admin' && !isAuthorizedAdmin(email)) {
      return res.status(403).json({
        message: 'Only naharamina68@gmail.com can be assigned admin role',
      });
    }

    // If trying to remove admin role from authorized email, prevent it
    if (role === 'user' && isAuthorizedAdmin(email)) {
      return res.status(403).json({
        message: 'Cannot remove admin role from authorized admin account',
      });
    }

    // Update fields if provided
    if (role && role !== 'admin') {
      existingUser.role = role;
    } else if (role === 'admin' && isAuthorizedAdmin(email)) {
      existingUser.role = 'admin';
    }
    
    if (displayName) existingUser.displayName = displayName;

    await existingUser.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: existingUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// Update user by uid
router.put('/:uid', async (req, res) => {
  const { uid } = req.params;
  const { role, displayName, email } = req.body;

  if (!uid) {
    return res.status(400).json({ message: 'UID is required' });
  }

  try {
    const existingUser = await User.findOne({ uid: uid });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent unauthorized admin role assignment
    if (role === 'admin' && !isAuthorizedAdmin(existingUser.email)) {
      return res.status(403).json({
        message: 'Only naharamina68@gmail.com can be assigned admin role',
      });
    }

    // If trying to remove admin role from authorized email, prevent it
    if (role === 'user' && isAuthorizedAdmin(existingUser.email)) {
      return res.status(403).json({
        message: 'Cannot remove admin role from authorized admin account',
      });
    }

    // If email is being changed, check admin authorization
    if (email && email.toLowerCase() !== existingUser.email.toLowerCase()) {
      // If current user is admin but new email is not authorized, remove admin
      if (existingUser.role === 'admin' && !isAuthorizedAdmin(email)) {
        return res.status(403).json({
          message: 'Cannot change email of admin account to non-authorized email',
        });
      }
      // If new email is authorized, grant admin role
      if (isAuthorizedAdmin(email) && role !== 'admin') {
        existingUser.role = 'admin';
      }
      existingUser.email = email.toLowerCase();
    }

    // Update fields if provided
    if (role && role !== 'admin') {
      // Only allow non-admin roles to be set (admin is handled above)
      existingUser.role = role;
    } else if (role === 'admin' && isAuthorizedAdmin(existingUser.email)) {
      existingUser.role = 'admin';
    }
    
    if (displayName) existingUser.displayName = displayName;

    await existingUser.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: existingUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// Delete user by uid
router.delete('/:uid', async (req, res) => {
  const { uid } = req.params;
  if (!uid) {
    return res.status(400).json({ message: 'UID is required' });
  }
  try {
    const existingUser = await User.findOne({ uid: uid });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.deleteOne({ uid: uid });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

export default router;
