const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, `./public/uploads`),
  filename: (req, file, cb) => {
    // cb(null, `${new Date().getTime()}_${file.originalname}`);
    cb(null, `${file.originalname}`);
  },
});

const filePath = (filename, host) => `http://${host}/static/media/${filename}`;

module.exports = {
  storage,
  filePath,
};
