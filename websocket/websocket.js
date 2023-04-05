const WebSocket = require("ws");

const onConnection = ({ client: ws, webSocket: wss }) => {
  const parseMessageType = ({ type, client, webSocket, message }) => {
    if (type === "device") {
      devicesNamespace({ client, webSocket, message });
    } else {
      client.send("Message recieved");
    }
  };
  const onMessage = ({ buffer, client, webSocket }) => {
    const message = JSON?.parse(buffer?.toString("utf8"));
    parseMessageType({
      type: message?.type,
      client: ws,
      webSocket: webSocket,
      message: message?.data,
    });
  };
  const devicesNamespace = ({ client, webSocket, message: device }) => {
    webSocket?.clients?.forEach((eachClient) => {
      if (eachClient !== client)
        eachClient?.send(JSON.stringify({ type: "device", data: device }));
    });
    client.imei = device?.imei || "";
    client?.send(
      JSON.stringify({
        type: "device",
        data: `Devices broadcasted successfully`,
      })
    );
  };

  const onClose = ({ client, webSocket }) => {
    webSocket?.clients?.forEach((eachClient) => {
      if (eachClient !== client) {
        eachClient?.send(JSON.stringify({ type: "disconnect", data: client }));
      }
    });
  };

  console.log(`NEW CLIENT CONNECTED`);
  ws.send(JSON.stringify("Welcome to NigTrak socket"));

  ws.on("message", (buffer) =>
    onMessage({ buffer, client: ws, webSocket: wss })
  );
  ws.on("close", (event) => onClose({ client: ws, webSocket: wss }));
};

module.exports = (server) => {
  const wss = new WebSocket.Server({ server: server });

  wss.on("connection", (ws) => onConnection({ client: ws, webSocket: wss }));
};
