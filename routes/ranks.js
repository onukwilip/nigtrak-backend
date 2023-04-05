const multer = require("multer");
const {
  getRanks,
  getRank,
  postRank,
  uploadRanks,
  putRank,
  getRanksMini,
} = require("../controllers/ranks");
const { storage } = require("../utils/utils");
const rankRouter = require("express").Router();

const upload = multer({
  storage: storage,
});

rankRouter.get("/", getRanks);
rankRouter.get("/mini", getRanksMini);
rankRouter.get("/:id", getRank);
rankRouter.post("/", upload.single("image"), postRank);
rankRouter.post("/bulk", uploadRanks);
rankRouter.put("/:id", upload.single("image"), putRank);

module.exports = rankRouter;
