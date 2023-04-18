import React from 'react';
import { useRef, useEffect, useCallback } from "react";
import { useState } from 'react';
import "./chat.scss"
import { Socket } from "socket.io-client";

interface RoomJoinProps {
  socket: Socket;
  isVisible: Boolean;
  onClose:() => void;
  footer: React.ReactNode;
}

export default function RoomJoin(props: RoomJoinProps) {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  // const [waring, setWarning] = useState("");
    const [formData, setFormData] = useState({
      roomName: "",
      visibility: "public",
      password : "",
    });

  const handleJoinRoom = () => {
      const payload={
        roomName: roomName,
        password: password,
      }
    // console.log("handleJoinRoom", payload);
    props.socket.emit("joinRoom",payload);
    setRoomName("");
    setPassword("");
  };

  const handleCloseAfterRoomCreated = useCallback((payload) => {
    console.log("roomJoined", payload);
      props.onClose()
    }, [])

  const  handleNotJoined = useCallback((payload) =>{
    if (payload.message.includes("exists")){
        alert("This room doesn't exists.");
    } else if(payload.message.includes("invited")){
        alert("You are not invited!");
    } else if(payload.message.includes("banned")){
        alert("You are banned :(");
    } else if(payload.message.includes("already")){
      alert("You are already a member in this room.");
    } else if(payload.message.includes("full")){
      alert("Sorry, this room is full.");
    } else if(payload.message.includes("incorrect")){
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
    }, [props.socket]);

    return (
      <div >
      {!props.isVisible ? null:(
        <div className="modal" onClick={props.onClose}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Join Room</h3>
              <span className="modal-close" onClick={props.onClose}>
              &times;
              </span>
            </div>
          <div className="modal-body">
            <div className="modal-content">
            <label htmlFor="roomName">Room Name</label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
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