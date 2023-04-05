const { connectDB, queryType } = require("node-mssql-lib");
const { v4: uuidV4 } = require("uuid");
const config = require("../utils/db-config");
const { filePath } = require("../utils/utils");

const getUsers = async (req, res) => {
  const pool = await connectDB({
    connection: config,
    query: "GetUsers",
    type: queryType.procedure,
  }).catch((e) => res.status(500).json({ message: e?.message, error: e }));

  const users = pool?.recordset;

  if (!Array.isArray(users) || users?.length < 1) {
    return res.status(404).json({});
  }

  for (const user of users) {
    user.Accessories = user?.Accessories?.split(",");
    user.Ammunition = user?.Ammunition?.split(",");
    const userDevices = await connectDB({
      connection: config,
      query: "GetUserDevices",
      type: queryType.procedure,
      inputs: [{ name: "UserId", value: user?.UserId }],
    }).catch((e) => ({ recordset: [] }));
    user.Devices = userDevices?.recordset;
  }

  return res.status(200).json(users);
};

const getUser = async (req, res) => {
  const pool = await connectDB({
    connection: config,
    query: "GetUser",
    type: queryType.procedure,
    inputs: [
      {
        name: "id",
        value: req.params.id,
      },
    ],
  }).catch((e) => res.status(500).json({ message: e?.message, error: e }));

  const users = pool?.recordset;

  if (!Array.isArray(users) || users?.length < 1) {
    return res.status(404).json({});
  }

  for (const user of users) {
    user.Accessories = user?.Accessories?.split(",");
    user.Ammunition = user?.Ammunition?.split(",");
    const userDevices = await connectDB({
      connection: config,
      query: "GetUserDevices",
      type: queryType.procedure,
      inputs: [{ name: "UserId", value: user?.UserId }],
    }).catch((e) => ({ recordset: [] }));
    user.Devices = userDevices?.recordset;
  }

  return res.status(200).json(users[0]);
};

const postUser = async (req, res) => {
  const { body, file } = req;
  let error = null;
  const userId = uuidV4();
  const pool = await connectDB({
    connection: config,
    type: queryType.procedure,
    query: "PostUser",
    inputs: [
      { name: "UserId", value: userId },
      { name: "Name", value: body?.name },
      { name: "Email", value: body?.email },
      { name: "Address", value: body?.address },
      { name: "Phone", value: body?.phone },
      { name: "Rank", value: body?.rank },
      { name: "Station", value: body?.station },
      { name: "Accessories", value: JSON.parse(body?.accessories)?.join(",") },
      { name: "Ammunition", value: JSON.parse(body?.ammos)?.join(",") },
      { name: "Devices", value: JSON.parse(body?.devices)?.join(",") },
      { name: "Image", value: filePath(file?.filename, req.headers.host) },
    ],
  }).catch((e) => (error = e?.message));

  if (error) {
    return res.status(500).json({ message: error });
  }

  return res.status(201)?.json({ message: "User created successfully" });
};

const uploadUsers = async (req, res) => {
  const { body } = req;
  const uploadedUsers = [];
  const errorLogs = [];

  if (!Array.isArray(body))
    return res
      .status(500)
      .json({ message: "JSON body must be an array of objects" });

  for (const user of body) {
    const userId = uuidV4();
    const pool = await connectDB({
      connection: config,
      type: queryType.procedure,
      query: "PostUser",
      inputs: [
        { name: "UserId", value: userId },
        { name: "Name", value: user?.name },
        { name: "Email", value: user?.email },
        { name: "Address", value: user?.address },
        { name: "Phone", value: user?.phone },
        { name: "Rank", value: user?.rank },
        { name: "Station", value: user?.station },
        { name: "Accessories", value: user?.accessories?.join(",") },
        { name: "Ammunition", value: user?.ammos?.join(",") },
        { name: "Devices", value: user?.devices?.join(",") },
        { name: "Image", value: null },
      ],
    }).catch((e) => errorLogs.push({ ...user, error: e?.message }));
    if (pool?.rowsAffected) {
      uploadedUsers.push(user);
    }
  }

  return res.status(200)?.json({
    message: "Users uploaded sucessfully",
    uploadUsers: uploadedUsers,
    errorLogs,
  });
};

const putUser = async (req, res) => {
  const { body, params, file } = req;
  let error = null;
  const pool = await connectDB({
    connection: config,
    type: queryType.procedure,
    query: "PutUser",
    inputs: [
      { name: "Id", value: parseInt(params?.id) },
      { name: "UserId", value: body?.userId },
      { name: "Name", value: body?.name },
      { name: "Email", value: body?.email },
      { name: "Address", value: body?.address },
      { name: "Phone", value: body?.phone },
      { name: "Rank", value: body?.rank },
      { name: "Station", value: body?.station },
      { name: "Accessories", value: JSON.parse(body?.accessories)?.join(",") },
      { name: "Ammunition", value: JSON.parse(body?.ammos)?.join(",") },
      { name: "Devices", value: JSON.parse(body?.devices)?.join(",") },
      {
        name: "Image",
        value: file ? filePath(file?.filename, req.headers.host) : body?.image,
      },
    ],
  }).catch((e) => (error = e?.message));

  if (error) {
    return res.status(500).json({ message: error });
  }

  return res.status(200)?.json({ message: "User updated successfully" });
};

module.exports = {
  getUser,
  getUsers,
  postUser,
  putUser,
  uploadUsers,
};
