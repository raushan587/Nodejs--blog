const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = 'layouts/admin'; // Use correct path
const jwtSecret = process.env.JWT_SECRET;

/**
 * Auth Middleware to check login
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

/**
 * GET /admin - Admin Login Page
 */
router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: 'Admin',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    };

    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * POST /admin - Admin Login
 */
router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

    // Secure the cookie and set it
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure secure cookie in production
      sameSite: 'Strict', // Prevent CSRF attacks
      maxAge: 3600000 // 1 hour expiration
    });

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * GET /dashboard - Admin Dashboard
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    };

    const data = await Post.find();
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * GET /add-post - Admin Add Post Page
 */
router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    };

    res.render('admin/add-post', { locals, layout: adminLayout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * POST /add-post - Admin Create New Post
 */
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    const { title, body } = req.body;

    const newPost = new Post({ title, body });
    await newPost.save(); // Ensure using save() instead of create() directly

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * GET /edit-post/:id - Admin Edit Post Page
 */
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Edit Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    };

    const data = await Post.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.render('admin/edit-post', { locals, data, layout: adminLayout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * PUT /edit-post/:id - Admin Update Post
 */
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const { title, body } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
      title,
      body,
      updatedAt: Date.now()
    });

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * DELETE /delete-post/:id - Admin Delete Post
 */
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * GET /logout - Admin Logout
 */
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

/**
 * POST /register - Admin Register
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: 'User Created', user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: 'User already exists' });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
















