const express = require("express");
const jwt = require("jsonwebtoken");
const AdminDB = require("../model/admin.model");
const bcrypt = require('bcrypt');
let route = express.Router();


route.get('/users', async (req, res) => {
  try {
    const admins = await AdminDB.find({}, { Password: 0 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins', error: error.message });
  }
});


route.post('/users', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ message: 'Email and Password are required' });
    }

    const existingAdmin = await AdminDB.findOne({ Email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    const newAdmin = new AdminDB({
      Email,
      Password: hashedPassword
    });

    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully', admin: { Email: newAdmin.Email } });
  } catch (error) {
    console.error('Error in /users POST route:', error);
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
});

route.post('/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const admin = await AdminDB.findOne({ Email });
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(Password, admin.Password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    
    const token = jwt.sign({ id: admin._id }, "SECRET_KEY", { expiresIn: '1h' });
    res.json({ success: true, token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = route;