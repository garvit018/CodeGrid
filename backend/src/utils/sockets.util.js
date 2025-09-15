const UserSocketMap = {};

export function join_User(socketId, UserName) {
  UserSocketMap[socketId] = UserName;
  return UserName;
}

export function get_Current_User(socketId) {
  return UserSocketMap[socketId];
}

export function user_Disconnect(socketId) {
  delete UserSocketMap[socketId];
}

export function get_User_in_room(io, RoomId) {
  return Array.from(io.sockets.adapter.rooms.get(RoomId) || []).map(
    (socketID) => ({
      socketID,
      UserName: UserSocketMap[socketID],
    })
  );
}
