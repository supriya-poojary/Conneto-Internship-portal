const multer = require('multer');

// Use memory storage for MongoDB binary storage
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // Increase to 15MB for large documents
});

module.exports = { upload };
