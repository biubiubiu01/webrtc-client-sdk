// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 存储房间信息（房间ID -> 成员列表）
const rooms = new Map();

io.on("connection", (socket) => {
  //加入房间
  socket.on("/webrtc/join", (data) => {
    const { roomId, userId } = data;
    rooms[roomId] = rooms[roomId] || [];

    socket.join(roomId);

    //将当前socket加入房间
    rooms[roomId].push({
      socketId: socket.id,
      userId,
    });

    console.log(`有新成员加入房间：${userId},当前房间成员数量：${rooms[roomId].length}`);

    //广播成员，xx成员已加入
    sendMessage(roomId, {
      type: "user-join",
      data,
    });
  });

  //离开房间
  socket.on("/webrtc/leave", (data) => {
    const { roomId, userId } = data;
    socket.leave(roomId);
    //从房间中移除当前socket
    rooms[roomId] = rooms[roomId].filter((member) => member.socketId !== socket.id);
    //广播成员，xx成员已离开
    sendMessage(roomId, {
      type: "user-left",
      data,
    });
  });

  //断开连接
  socket.on("disconnect", () => {
    let disconnectInfo = null;
    for (const roomId in rooms) {
      const findIndex = rooms[roomId].findIndex((member) => member.socketId === socket.id);
      if (findIndex !== -1) {
        disconnectInfo = {
          roomId,
          ...rooms[roomId][findIndex],
        };
        rooms[roomId].splice(findIndex, 1);
      }
    }

    console.log(`有成员离开房间：${disconnectInfo.userId},当前房间成员数量：${rooms[disconnectInfo.roomId].length}`);

    sendMessage(disconnectInfo.roomId, {
      type: "user-left",
      data: {
        ...disconnectInfo,
      },
    });
  });

  //监听candidate
  socket.on("/webrtc/candidate", (message) => {
    const { roomId, data, userId } = message;
    sendMessage(roomId, {
      type: "candidate",
      data: message,
    });
  });

  //监听offer
  socket.on("/webrtc/offer", (message) => {
    const { roomId, data, userId } = message;
    sendMessage(roomId, {
      type: "offer",
      data: message,
    });
  });

  //监听answer
  socket.on("/webrtc/answer", (message) => {
    const { roomId, data } = message;
    sendMessage(roomId, {
      type: "answer",
      data: message,
    });
  });
});

// 给房间里面的成员发送消息
function sendMessage(roomId, message) {
  io.to(roomId).emit("message", message);
}

app.get("/", (req, res) => {
  res.send("Signaling server is running");
});

server.listen(8999, () => {
  console.log("Signaling server running on port 8999");
});
