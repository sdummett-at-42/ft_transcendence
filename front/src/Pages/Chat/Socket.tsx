import { io, Socket } from "socket.io-client";
import Cookies from 'js-cookie';

let socket: Socket;
const connectCookie = Cookies.get('connect.sid')

export const connectSocket = () => {
  socket = io("http://localhost:3001",{
    auth: {
        token: connectCookie,
      }

  });

  socket.on("connect", () => {
    console.log("Connected to server!");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server!");
  });
  socket.on("roomsListReceived", (payload) => console.log(`The payload is: ${JSON.stringify(payload)}`));


  socket.on("connect", () => {
    console.log("Connected to server!");
  });
  socket.on("disconnect", () => {
    console.log("Disconnected from server!");
  });
  socket.on("message", (data) => {
    console.log(`Received message: ${data}`);
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
  socket.on("roomMsgNotSended", function(payload) {
    console.log("roomMsgNotSended", payload)
  })
  socket.on("roomMsgNotReceived", function(payload) {
    console.log("roomMsgNotReceived", payload)
  });
  socket.on("roomCreated", function(payload) {
    console.log("roomCreated", payload)
  });
  socket.on("roomNotCreated", (payload) => console.log(`noT CREATED The payload is: ${JSON.stringify(payload)}`));
  socket.on("roomNotUpdated", function(payload) {
    console.log("roomNotUpdated", payload)
  });
  socket.on("roomUpdated", function(payload) {
    console.log("roomUpdated", payload)
  });
  socket.on("roomNotJoined", function(payload) {
    console.log("roomNotJoined", payload)
  });
  socket.on("roomNotLeft", function(payload) {
    console.log("roomNotLeft", payload)
  });
  socket.on("roomAdminNotAdded", function(payload) {
    console.log("roomAdminNotAdded", payload)
  });
  socket.on("roomAdminAdded", function(payload) {
    console.log("roomAdminAdded", payload)
  });
  socket.on("roomAdminNotRemoved", function(payload) {
    console.log("roomAdminNotRemoved", payload)
  });
  socket.on("roomAdminRemoved", function(payload) {
    console.log("roomAdminRemoved", payload)
  });
  socket.on("roomOwnershipNotGived", function(payload) {
    console.log("roomOwnershipNotGived", payload)
  });
  socket.on("roomOwnershipGived", function(payload) {
    console.log("roomOwnershipGived", payload)
  });
  socket.on("userNotKicked", function(payload) {
    console.log("userNotKicked", payload)
  });
  socket.on("userKicked", function(payload) {
    console.log("userKicked", payload)
  });
  socket.on("userNotBanned", function(payload) {
    console.log("userKicked", payload)
  });
  socket.on("userBanned", function(payload) {
    console.log("userBanned", payload)
  });
  socket.on("userNotUnbanned", function(payload) {
    console.log("userNotUnbanned", payload)
  });
  socket.on("userUnbanned", function(payload) {
    console.log("userUnbanned", payload)
  });
  socket.on("userNotMuted", function(payload) {
    console.log("userNotMuted", payload)
  });
  socket.on("userMuted", function(payload) {
    console.log("userMuted", payload)
  });
  socket.on("userNotUnmuted", function(payload) {
    console.log("userNotUnmuted", payload)
  });
  socket.on("userUnmuted", function(payload) {
    console.log("userUnmuted", payload)
  });
  socket.on("userNotBlocked", function(payload) {
    console.log("userUnmuted", payload)
  });
  socket.on("userBlocked", function(payload) {
    console.log("userBlocked", payload)
  });
  socket.on("userNotUnblocked", function(payload) {
    console.log("userNotUnblocked", payload)
  });
  socket.on("userUnblocked", function(payload) {
    console.log("userUnblocked", payload)
  });
  socket.on("userNotInvited", function(payload) {
    console.log("userNotInvited", payload)
  });
  socket.on("userInvited", function(payload) {
    console.log("userInvited", payload)
  });
  socket.on("userNotUnvited", function(payload) {
    console.log("userNotUnvited", payload)
  });
  socket.on("userUninvited", function(payload) {
    console.log("userUninvited", payload)
  });
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};