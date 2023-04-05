const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const deviceRouter = require("./routes/device");
const usersRouter = require("./routes/users");
const webSocket = require("./websocket/websocket");
const rankRouter = require("./routes/ranks");
const server = require("http").createServer(app);
const os = require("os");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));
app.use("/static/media", express.static(`${__dirname}/public/uploads`));

webSocket(server);

app.use("/api/device", deviceRouter);
app.use("/api/users", usersRouter);
app.use("/api/ranks", rankRouter);
app.use((err, req, res, next) => {
  res.status(err?.status || 500)?.send(err);
  next();
});

server.listen(5000, () => console.log("Server listening on port 5000"));
