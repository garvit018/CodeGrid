// backend/src/socketServer.js
import { Server } from "socket.io";
import {
  join_User,
  get_Current_User,
  user_Disconnect,
  get_User_in_room,
} from "../utils/sockets.util.js";

const ACTIONS = {
  JOIN: "join",
  JOINED: "joined",
  DISCONNECTED: "disconnected",
  CODE_CHANGE: "code-change",
  SYNC_CODE: "sync-code",
  LEAVE: "leave",
};

const createSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET,POST,PUT,DELETE"],
    },
  });

  // make available everywhere
  global.io = io;

  io.on("connection", (socket) => {
    socket.on(ACTIONS.JOIN, ({ RoomId, UserName }) => {
      join_User(socket.id, UserName);
      socket.join(RoomId);

      const clients = get_User_in_room(io, RoomId);
      clients.forEach(({ socketID }) => {
        io.to(socketID).emit(ACTIONS.JOINED, {
          clients,
          UserName,
          socketID: socket.id,
        });
      });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ RoomId, code, linenumber }) => {
      socket.in(RoomId).emit(ACTIONS.CODE_CHANGE, {
        code,
        linenumber,
        UserName: get_Current_User(socket.id),
      });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ code, socketID }) => {
      io.to(socketID).emit(ACTIONS.CODE_CHANGE, { code, linenumber: 10000 });
    });

    socket.on("disconnecting", () => {
      const rooms = [...socket.rooms];
      rooms.forEach((RoomId) => {
        socket.in(RoomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          UserName: get_Current_User(socket.id),
        });
      });
      user_Disconnect(socket.id);
    });
  });

  return io; // <--- important
};

export default createSocketServer;
