const {
  getUsers,
  postUser,
  getUser,
  putUser,
  uploadUsers,
} = require("../controllers/users");
const multer = require("multer");
const { storage } = require("../utils/utils");
const usersRouter = require("express").Router();

const upload = multer({
  storage: storage,
});

usersRouter.get("/", getUsers);
usersRouter.get("/:id", getUser);
usersRouter.post("/", upload.single("image"), postUser);
usersRouter.post("/bulk", uploadUsers);
usersRouter.put("/:id", upload.single("image"), putUser);

module.exports = usersRouter;
