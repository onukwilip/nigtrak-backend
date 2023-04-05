const {
  getDevices,
  getDevice,
  postDevice,
  putDevice,
  uploadDevices,
} = require("../controllers/device");
const deviceRouter = require("express").Router();

deviceRouter.get("/", getDevices);
deviceRouter.get("/:id", getDevice);
deviceRouter.post("/", postDevice);
deviceRouter.post("/bulk", uploadDevices);
deviceRouter.put("/:id", putDevice);

module.exports = deviceRouter;
