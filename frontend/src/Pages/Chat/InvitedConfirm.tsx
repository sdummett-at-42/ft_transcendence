
import React from 'react';
import { useRef, useEffect, useCallback } from "react";
import { useState } from 'react';
import "./chat.scss"
import { Socket } from "socket.io-client";

interface InvitedConfirmProps {
  socket: Socket,
  isVisible: Boolean,
  onClose: () => void,
  message: string,
  RoomName: string,
}
export default function InvitedConfirm(props: InvitedConfirmProps) {
  const [password, setPassword] = useState("");

  const handleJoinRoom = () => {
    console.log("Room", props.RoomName)
    const payload = {
      roomName: props.RoomName,
      password: password,
    }
    console.log("handleJoinRoom", payload);
    props.socket.emit("joinRoom", payload);
    setPassword("");
  };

  const handleCloseAfterRoomCreated = useCallback((payload) => {
    console.log("roomJoined", payload);
    props.onClose()
  }, [])

  const handleNotJoined = useCallback((payload) => {
    if (payload.message.includes("exists")) {
      alert("This room doesn't exists.");
    } else if (payload.message.includes("invited")) {
      alert("You are not invited!");
    } else if (payload.message.includes("banned")) {
      alert("You are banned :(");
    } else if (payload.message.includes("already")) {
      alert("You are already a member in this room.");
    } else if (payload.message.includes("full")) {
      alert("Sorry, this room is full.");
    } else if (payload.message.includes("incorrect")) {
      alert("Password is incorrect! try again!");
      setPassword("");
    } else {
      console.log("there is anotehr reason for notjoinedroom?");
    }
  }, [])

  useEffect(() => {
    if (props.socket) {
      props.socket.on("roomJoined", handleCloseAfterRoomCreated);
      props.socket.on("roomNotJoined", handleNotJoined);
    }
    return () => {
      if (props.socket) {
        props.socket.off('roomJoined', handleCloseAfterRoomCreated);
        props.socket.off("roomNotJoined", handleNotJoined);
      }
    };
  }, [props.socket, handleCloseAfterRoomCreated, handleNotJoined]);

  return (
    <div >
      {!props.isVisible ? null : (
        <div className="modal" onClick={props.onClose}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">{props.message}</h5>
              <span className="modal-close" onClick={props.onClose}>
                &times;
              </span>
            </div>
            <div className="modal-body">
              <div className="modal-content">
                <h3>Would you like to join room {props.RoomName} ? </h3>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Optional"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="modal-form">
                  <button onClick={handleJoinRoom}>Join</button>
                  <button onClick={props.onClose}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>)}
    </div>

  );
};

