import User from '../model/User.js';
import Admin from '../model/Admin.js';

export const authenticateUser = async (req, res) => {
  const { name, email } = req.body;

  if (name && email) {
    try {
      let user = await User.findOne({ email });
      
      if (user) {
        return res.status(200).json({ message: 'Authentication successful', user });
      }

      user = new User({ name, email, status: 'NoBatch' });
      await user.save();
      return res.status(200).json({ message: 'Authentication successful', user });
    } catch (error) {
      return res.status(500).json({ message: 'Error saving user', error: error.message });
    }
  } else {
    return res.status(400).json({ message: 'Authentication failed' });
  }
}

export const getuserData = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate('batch');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    let batchDetails = null;
    if (user.batch) {
      batchDetails = {
        batchId: user.batch._id,
        batchName: user.batch.name
      };
    }
    return res.status(200).json({
      user,
      batchDetails
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

export const adminSignup = async (req, res) => {
  const { name, email, password } = req.body;

  if (name && email && password) {
    try {
      let admin = await Admin.findOne({ email });

      if (admin) {
        return res.status(400).json({ message: 'Admin already exists' });
      }

      admin = new Admin({ name, email, password });
      await admin.save();
      return res.status(201).json({ message: 'Admin registered successfully', admin });
    } catch (error) {
      return res.status(500).json({ message: 'Error registering admin', error: error.message });
    }
  } else {
    return res.status(400).json({ message: 'All fields are required' });
  }
};

export const adminSignin = async (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        return res.status(400).json({ message: 'Admin not found' });
      }

      if (admin.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      return res.status(200).json({ message: 'Signin successful', admin });
    } catch (error) {
      return res.status(500).json({ message: 'Error during signin', error: error.message });
    }
  } else {
    return res.status(400).json({ message: 'Email and password are required' });
  }
};

export const getAdminData = async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    return res.status(200).json({ admin });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching admin', error: error.message });
  }
}; 