const express = require('express');
const multer = require('multer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const app = express();

// Security middleware
app.use(helmet());

// Rate limit to prevent abuse
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20, // limit each IP to 20 requests per window
}));

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-z0-9.\-]/gi, '_');
    cb(null, Date.now() + '_' + safeName);
  }
});

// File filter
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

app.post('/upload', upload.single('photo'), (req, res) => {
  res.send('File uploaded successfully!');
});

// Error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'Invalid file type') {
    return res.status(400).send(err.message);
  }
  res.status(500).send('Something went wrong.');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
