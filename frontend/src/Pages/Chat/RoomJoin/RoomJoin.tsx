import React from 'react';
import { useRef, useEffect, useCallback } from "react";
import { useState } from 'react';
import "../RoomCreate/RoomCreate.css"
import { Socket } from "socket.io-client";

interface RoomJoinProps {
  socket: Socket;
  isVisible: Boolean;
  onClose: () => void;
  footer: React.ReactNode;
}

export default function RoomJoin(props: RoomJoinProps) {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  // const [waring, setWarning] = useState("");
  const [formData, setFormData] = useState({
    roomName: "",
    visibility: "public",
    password: "",
  });

  const handleJoinRoom = () => {
    const payload = {
      roomName: roomName,
      password: password,
    }
    // console.log("handleJoinRoom", payload);
    props.socket.emit("joinRoom", payload);
    setRoomName("");
    setPassword("");
  };

  const handleCloseAfterRoomCreated = useCallback((payload) => {
    console.log("roomJoined", payload);
    props.onClose()
  }, [])

  const handleNotJoined = useCallback((payload) => {
      alert(payload.message);
  }, [])

  useEffect(() => {
    if(props.socket){
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

  return !props.isVisible ? null : (
        <div className="RoomCreate-screen-card">
          <div className="RoomCreate-screen-card-overlay"></div>
          <div className="RoomCreate-screen-card-content">
						  <div className="RoomCreate-screen-card-content-body">
                  <h3 className="Profile-screen-card-title">Rejoindre un salon</h3>
                  <div className="RoomCreate-screen-card-form-wrapper">
                  <div className="RoomCreate-screen-card-input-wrapper">
                      <label htmlFor="roomName" className="Profile-screen-card-text">Nom du salon</label>
                      <input
                          type="text"
                          className="RoomCreate-screen-card-input"
                          value={roomName}
                          onChange={(e) => setRoomName(e.target.value)}
                          required
                          autoFocus={true}
                          autoComplete='off'
                      />
                  </div>
                  <div className="RoomCreate-screen-card-input-wrapper">
                      <label htmlFor="password" className="Profile-screen-card-text">Mot de passe</label>
                      <input
                          type="password"
                          className="RoomCreate-screen-card-input"
                          placeholder="Si le salon est privé"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                      />
                  </div>
                  </div>
                <div className="RoomCreate-button-wrapper">
                  <button onClick={props.onClose} className="Settings-button">Annuler</button>
                  <button onClick={handleJoinRoom} className="Settings-button">Rejoindre</button>
                </div>
              </div>
            </div>
          </div>
  );
};