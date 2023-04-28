import React, { useState, useEffect, useCallback } from 'react';
import "../RoomCreate/RoomCreate.css"
import { Socket } from "socket.io-client";
import PublicRooms from '../PublicRooms/PublicRooms';

interface RoomJoinProps {
    socket: Socket;
    isVisible: Boolean;
    onClose: () => void;
    footer: React.ReactNode;
}

export default function RoomJoin(props: RoomJoinProps) {
    const [roomName, setRoomName] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState({});

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

    const handleEnter = (event) => {
        if (event.key === 'Enter') {
          setErrorMessage((prevErrors) => ({
            ...prevErrors,
            roomName: "",
            password: "",
        }));
            event.preventDefault();
            handleJoinRoom();
        }
    };

    const handleEscape = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            props.onClose();
        }
    };

    const handleJoinRoom = () => {
        if (roomName === "") {
            setErrorMessage((prevErrors) => ({
                ...prevErrors,
                roomName: "Le nom du salon ne peut pas être vide",
            }));
            return;
        }
        const payload = {
            roomName: roomName,
            password: password,
        }
        props.socket.emit("joinRoom", payload);
        setRoomName("");
        setPassword("");
    };

    const handleCloseAfterRoomCreated = useCallback((payload) => {
        props.onClose()
    }, [])

    const handleNotJoined = useCallback((payload) => {
      setErrorMessage((prevErrors) => ({
        ...prevErrors,
        password: payload.message,
    }));
    }, [])



  return !props.isVisible ? null : (
        <div className="RoomCreate-screen-card" onKeyDown={handleEscape}>
          <div className="RoomCreate-screen-card-overlay"></div>
          <div className="RoomCreate-screen-card-content">
						  <div className="RoomCreate-screen-card-content-body">
                  <h3 className="Profile-screen-card-title">Rejoindre un salon</h3>
				  <PublicRooms socket={props.socket} onClose={props.onClose} />
                  <div className="RoomCreate-screen-card-form-wrapper">
                  <div className="RoomCreate-screen-card-input-wrapper">
                      <label htmlFor="roomName" className="Profile-screen-card-text">Nom du salon</label>
                      <input
                          type="text"
                          className="RoomCreate-screen-card-input"
                          value={roomName}
                          onChange={(e) => setRoomName(e.target.value)}
                          onKeyDown={handleEnter}
                          required
                          autoFocus={true}
                          autoComplete='off'
                      />
                      {errorMessage.roomName && (<div className='Settings-error'>{errorMessage.roomName}</div>)}
                  </div>
                  <div className="RoomCreate-screen-card-input-wrapper">
                      <label htmlFor="password" className="Profile-screen-card-text">Mot de passe</label>
                      <input
                          type="password"
                          className="RoomCreate-screen-card-input"
                          placeholder="Si le salon est protégé"
                          onKeyDown={handleEnter}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                      />
                      {errorMessage.password && (<div className='Settings-error'>{errorMessage.password}</div>)}
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