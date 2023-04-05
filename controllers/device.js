const { connectDB, queryType } = require("node-mssql-lib");
const config = require("../utils/db-config");

const getDevices = async (req, res) => {
  const pool = await connectDB({
    connection: config,
    query: "GetDevices",
    type: queryType.procedure,
  }).catch((e) => res.status(500).json({ message: e?.message, error: e }));

  if (pool?.recordset?.length < 1) {
    return res.status(404).json([]);
  }

  return res.status(200).json(pool?.recordset);
};

const getDevice = async (req, res) => {
  const pool = await connectDB({
    connection: config,
    query: "GetDevice",
    type: queryType.procedure,
    inputs: [
      {
        name: "id",
        value: req.params.id,
      },
    ],
  }).catch((e) => res.status(500).json({ message: e?.message, error: e }));

  if (pool?.recordset?.length < 1) {
    return res.status(404).json({});
  }

  return res.status(200).json(pool?.recordset[0]);
};

const postDevice = async (req, res) => {
  const { body } = req;
  let error = null;
  await connectDB({
    connection: config,
    type: queryType.procedure,
    query: "PostDevice",
    inputs: [
      {
        name: "imei",
        value: body?.imei,
      },
      { name: "serialNo", value: body?.serialNumber },
      { name: "deviceModel", value: body?.deviceModel },
    ],
  }).catch((e) => (error = e?.message));

  if (error) {
    return res.status(500).json({ message: error });
  }

  return res.status(201)?.json({ message: "Device created successfully" });
};

const uploadDevices = async (req, res) => {
  const { body } = req;
  const uploadedDevices = {};
  const errorLogs = [];

  if (!Array.isArray(body))
    return res
      .status(500)
      .json({ message: "JSON body must be an array of objects" });

  for (const device of body) {
    const pool = await connectDB({
      connection: config,
      type: queryType.procedure,
      query: "PostDevice",
      inputs: [
        {
          name: "imei",
          value: device?.imei,
        },
        { name: "serialNo", value: device?.serialNumber },
        { name: "deviceModel", value: device?.deviceModel },
      ],
    }).catch((e) => errorLogs.push({ ...device, error: e?.message }));
    if (pool?.rowsAffected) {
      uploadedDevices[device?.imei] = device;
    }
  }

  return res.status(200)?.json({
    message: "Devices uploaded sucessfully",
    uploadedDevices: uploadedDevices,
    errorLogs,
  });
};

const putDevice = async (req, res) => {
  const { body, params } = req;
  let error = null;

  await connectDB({
    connection: config,
    type: queryType.procedure,
    query: "PutDevice",
    inputs: [
      {
        name: "imei",
        value: params?.id,
      },
      { name: "serialNo", value: body?.serialNumber },
      { name: "deviceModel", value: body?.deviceModel },
    ],
  }).catch((e) => (error = e?.message));

  if (error) {
    return res.status(500).json({ message: error });
  }

  return res.status(200)?.json({ message: "Device created successfully" });
};

module.exports = {
  getDevice,
  getDevices,
  postDevice,
  putDevice,
  uploadDevices,
};
