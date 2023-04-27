
import React, { useState, useEffect, useCallback } from 'react';
import "./Popup.css"
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
    const payload = {
      roomName: props.RoomName,
      password: password,
    }
    props.socket.emit("joinRoom", payload);
    setPassword("");
  };

  const handleCloseAfterRoomCreated = useCallback((payload) => {
    props.onClose()
  }, [])

  const handleNotJoined = useCallback((payload) => {
      alert(payload.message);
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
      <div>
          {!props.isVisible ? null : (
            <div className="RoomCreate-screen-card">
                <div className="RoomCreate-screen-card-overlay"></div>
                <div className="RoomCreate-screen-card-content">
                    <div className="RoomCreate-screen-card-content-body">
                        <div className='Profile-screen-card-title'>Voulez-vous rejoindre : </div>
                        <div className='Profile-screen-card-title'>{props.RoomName}</div>
                        <div className='Invited-screen'>
                        <label htmlFor="password" className='Profile-screen-card-text'>Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            className="RoomCreate-screen-card-input"
                            placeholder="Si la salle est privée"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                          </div>
                        <div className="RoomCreate-button-wrapper">
                            <button onClick={props.onClose} className='Settings-button'>Annuler</button>
                            <button onClick={handleJoinRoom} className='Settings-button Settings-upload-button'>Rejoindre</button>
                        </div>
                    </div>
                </div>
            </div>
          )}
      </div>
  );
};

