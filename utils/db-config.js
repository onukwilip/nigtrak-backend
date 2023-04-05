const config = {
  server: `197.211.39.203\\MSSQLSERVER2014`,
  database: "NigTrack",
  user: "sa",
  password: "Passw0rd",
  options: {
    // trustedConnection: true,
    trustCertificate: true,
  },
};

module.exports = config;
