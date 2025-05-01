// /config/db.js
const mongoose = require('mongoose');

module.exports = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,  // Keep this option
    // useUnifiedTopology: true,  // Remove this option
  })
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
};