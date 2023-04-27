import React, { useState, useEffect, useContext, useCallback } from 'react';
import "./Popup.css"
import { Socket } from "socket.io-client";
import { DatabaseContext } from '../ChatLogin';

interface SettingProps {
  socket: Socket,
  isVisible: Boolean,
  onClose: () => void,
  roomName: string,
  onUpdate: () => void;
}

export default function Setting(props: SettingProps) {
  const [access, setAccess] = useState("public");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState("");
  const database = useContext(DatabaseContext);

  const handleAccessChange = () => {
    if (access === "private" && password.length === 0) {
      alert("Un salon privé doit avoir un mot de passe.");
      return;
    }
    if (access === "public" && password.length > 0) {
      setAccess("private");
    }
    const payload = {
      roomName: props.roomName,
      visibility: access,
      password: password,
    }
    props.socket.emit("updateRoom", payload);
  }

  useEffect(() => {
    if (password.length > 0) {
      setAccess("private");
    }
  }, [password, access]);

  const handleAddAdmin = () => {
    let user = database.find((user) => user.name === admin);
    if (user === undefined) {
      alert("User not found. Please try again.");
      return;
    }
    console.log("user", user);
    const payload = {
      roomName: props.roomName,
      userId: user.id
    }
    props.socket.emit("addRoomAdmin", payload);
  }

  const handleRoomUpdated = useCallback((payload) => {
    console.log("handleRoomsUpdate", payload);
    props.onClose();
  }, []);

  const handleAlertmessage = useCallback((payload) => {
    alert(payload.message);
  }, []);

  useEffect(() => {
    if(props.socket){
      props.socket.on("roomAdminAdded", handleAlertmessage);
      props.socket.on("roomAdminNotAdded", handleAlertmessage);
      props.socket.on("roomUpdated", handleRoomUpdated);
      props.socket.on("roomNotUpdated", handleAlertmessage);
    }
    return () => {
      if(props.socket){
        props.socket.off("roomAdminAdded",handleAlertmessage);
        props.socket.off("roomAdminNotAdded",handleAlertmessage);
        props.socket.off("roomUpdated", handleRoomUpdated);
        props.socket.off("roomNotUpdated", handleAlertmessage);
      }
    };
  }, [props.socket, handleAlertmessage, handleRoomUpdated]);

  return !props.isVisible ? null : (
      <div className="RoomCreate-screen-card">
          <div className="RoomCreate-screen-card-overlay"></div>
          <div className="RoomCreate-screen-card-content">
              <div className="RoomCreate-screen-card-content-body">
                  <h3 className="Profile-screen-card-title">Paramètre {props.roomName}</h3>
                  <div className="RoomSettings-wrapper">
                      <label htmlFor="inputAccess" className='Profile-screen-card-text'>Accessibilité</label>
                      <select name="visibility" className="RoomCreate-screen-card-select" value={access} onChange={(e) => setAccess(e.target.value)}>
                          <option value="public" className='RoomCreate-screen-card-option'>Public</option>
                          <option value="private" className='RoomCreate-screen-card-option'>Privé</option>
                      </select>
                  </div>
                  <div className="RoomSettings-wrapper">
                      <label htmlFor="inputPassword" className='Profile-screen-card-text'>Mot de passe</label>
                      <input type="text" className="RoomCreate-screen-card-input" name="password" placeholder="Champ vide pour suppression" value={password} onChange={(e) => setPassword(e.target.value)} />
                      <button className="Settings-button Settings-upload-button" onClick={handleAccessChange}>Modifier</button>
                  </div>

                  <div className="RoomSettings-wrapper">
                      <label htmlFor="inputAdmin" className='Profile-screen-card-text'>Nouvel administrateur</label>
                      <input type="text" className="RoomCreate-screen-card-input" name="Name" placeholder="Nom" value={admin} onChange={(e) => setAdmin(e.target.value)} />
                      <div onClick={handleAddAdmin}> <button className='Settings-button Settings-upload-button'>Ajouter</button></div>
                  </div>

              </div>
          </div>
      </div>
  );
};
