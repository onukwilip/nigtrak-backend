const { connectDB, queryType } = require("node-mssql-lib");
const config = require("../utils/db-config");
const { v4: uuidV4 } = require("uuid");
const { filePath } = require("../utils/utils");

const optimizeRanks = (/**@type Array */ ranks) => {
  const rankObj = {};

  //   ranks.forEach((rank) => {
  //     if (rankObj[rank?.RankId])
  //       rankObj[rank?.RankId]?.Members?.push({
  //         UserId: rank?.UserId,
  //         Name: rank?.Name,
  //         Email: rank?.Email,
  //         Address: rank?.Address,
  //         Phone: rank?.Phone,
  //         Image: rank?.UserImage,
  //       });
  //     else
  //       rankObj[rank?.RankId] = {
  //         RankId: rank?.RankId,
  //         RankName: rank?.RankName,
  //         Image: rank?.Image,
  //         Members: rank?.UserId
  //           ? [
  //               {
  //                 Name: rank?.Name,
  //                 Email: rank?.Email,
  //                 Address: rank?.Address,
  //                 Phone: rank?.Phone,
  //                 Image: rank?.UserImage,
  //               },
  //             ]
  //           : [],
  //       };
  //   });

  ranks.forEach((rank) => {
    //IF RANK EXISTS IN THE RANK OBJECT
    if (rankObj[rank?.RankId]) {
      //IF RANK.MEMBERS IS AN ARRAY (MEANING MEMBERS HAS BEEN ADDED PREVOUSLY)
      if (Array.isArray(rankObj[rank?.RankId]?.Members)) {
        //GET INDEX OF USER WITH THIS USERID
        const userIdIndex = rankObj[rank?.RankId]?.Members?.findIndex(
          (member) => member?.UserId === rank?.UserId
        );
        //IF THIS MEMBER HAS PREVIOUSLY BEEN ADDED
        if (userIdIndex > -1) {
          rankObj[rank?.RankId].Members[userIdIndex] = {
            ...rankObj[rank?.RankId]?.Members[userIdIndex],
            Devices: rankObj[rank?.RankId]?.Members[userIdIndex]?.Devices
              ? [
                  ...rankObj[rank?.RankId]?.Members[userIdIndex]?.Devices,
                  rank?.IMEI_Number,
                ]
              : [rank?.IMEI_Number],
          };
        }
        //IF THIS MEMBER HASN'T BEEN ADDED
        else {
          rankObj[rank?.RankId].Members?.push({
            UserId: rank?.UserId,
            Name: rank?.Name,
            Email: rank?.Email,
            Address: rank?.Address,
            Phone: rank?.Phone,
            Image: rank?.UserImage,
            Devices: rank?.IMEI_Number ? [rank?.IMEI_Number] : [],
          });
        }
      }
      //IF NO MEMBER HAS BEEN PREVIOUSLY ADDED
      else {
        rankObj[rank?.RankId].Members = [
          {
            UserId: rank?.UserId,
            Name: rank?.Name,
            Email: rank?.Email,
            Address: rank?.Address,
            Phone: rank?.Phone,
            Image: rank?.UserImage,
            Devices: rank?.IMEI_Number ? [rank?.IMEI_Number] : [],
          },
        ];
      }
    }
    //IF THIS IS A NEW RANK
    else {
      rankObj[rank?.RankId] = {
        RankId: rank?.RankId,
        RankName: rank?.RankName,
        Image: rank?.Image,
        Members: rank?.UserId
          ? [
              {
                UserId: rank?.UserId,
                Name: rank?.Name,
                Email: rank?.Email,
                Address: rank?.Address,
                Phone: rank?.Phone,
                Image: rank?.UserImage,
                Devices: rank?.IMEI_Number ? [rank?.IMEI_Number] : [],
              },
            ]
          : [],
      };
    }
  });

  return Object.entries(rankObj).map(([key, rank]) => rank);
};

const optimizeRanksMini = (/**@type Array */ ranks) => {
  const rankObj = {};

  ranks.forEach((rank) => {
    rankObj[rank?.RankId] = {
      RankId: rank?.RankId,
      RankName: rank?.RankName,
      Image: rank?.Image,
    };
  });

  return Object.entries(rankObj).map(([key, rank]) => rank);
};

const getRanks = async (req, res) => {
  const pool = await connectDB({
    connection: config,
    query: "GetRanks",
    type: queryType.procedure,
  }).catch((e) => res.status(500).json({ message: e?.message, error: e }));

  if (pool?.recordset?.length < 1) {
    return res.status(404).json([]);
  }

  return res.status(200).json(optimizeRanks(pool?.recordset));
};

const getRanksMini = async (req, res) => {
  const pool = await connectDB({
    connection: config,
    query: "GetRanks",
    type: queryType.procedure,
  }).catch((e) => res.status(500).json({ message: e?.message, error: e }));

  if (pool?.recordset?.length < 1) {
    return res.status(404).json([]);
  }

  return res.status(200).json(optimizeRanksMini(pool?.recordset));
};

const getRank = async (req, res) => {
  let error = null;
  const pool = await connectDB({
    connection: config,
    query: "GetRank",
    type: queryType.procedure,
    inputs: [
      {
        name: "RankId",
        value: req.params.id,
      },
    ],
  }).catch((e) => (error = e?.message));

  if (error) {
    return res.status(500).json({ message: error });
  }

  if (pool?.recordset?.length < 1)
    return res.status(404).json({ message: "Rank does not exist" });

  return res
    .status(200)
    .json(
      optimizeRanksMini(pool?.recordset)?.length > 0
        ? optimizeRanksMini(pool?.recordset)[0]
        : {}
    );
};

const postRank = async (req, res) => {
  const { body, file } = req;
  let error = null;
  await connectDB({
    connection: config,
    type: queryType.procedure,
    query: "PostRank",
    inputs: [
      {
        name: "RankId",
        value: `RANK_${uuidV4()}`,
      },
      { name: "Name", value: body?.name },
      { name: "Image", value: filePath(file?.filename, req.headers.host) },
    ],
  }).catch((e) => (error = e?.message));

  if (error) {
    return res.status(500).json({ message: error });
  }

  return res.status(201)?.json({ message: "Rank added successfully" });
};

const uploadRanks = async (req, res) => {
  const { body } = req;
  const uploadedRanks = {};
  const errorLogs = [];

  if (!Array.isArray(body))
    return res
      .status(500)
      .json({ message: "JSON body must be an array of objects" });

  for (const rank of body) {
    const pool = await connectDB({
      connection: config,
      type: queryType.procedure,
      query: "PostRank",
      inputs: [
        {
          name: "RankId",
          value: `RANK_${uuidV4()}`,
        },
        { name: "Name", value: rank?.name },
        { name: "Image", value: null },
      ],
    }).catch((e) => errorLogs.push({ ...rank, error: e?.message }));
    if (pool?.rowsAffected) {
      uploadedRanks[rank?.name] = rank;
    }
  }

  return res.status(200)?.json({
    message: "Ranks uploaded sucessfully",
    uploadedRanks,
    errorLogs,
  });
};

const putRank = async (req, res) => {
  const { body, file, params } = req;
  let error = null;
  await connectDB({
    connection: config,
    type: queryType.procedure,
    query: "PutRank",
    inputs: [
      {
        name: "RankId",
        value: params.id,
      },
      { name: "Name", value: body?.name },
      {
        name: "Image",
        value: file ? filePath(file?.filename, req.headers.host) : body?.image,
      },
    ],
  }).catch((e) => (error = e?.message));

  if (error) {
    return res.status(500).json({ message: error });
  }

  return res.status(200)?.json({ message: "Rank updated successfully" });
};

module.exports = {
  getRank,
  getRanks,
  getRanksMini,
  postRank,
  putRank,
  uploadRanks,
};
