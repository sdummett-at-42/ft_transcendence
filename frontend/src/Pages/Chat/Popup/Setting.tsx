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
  const [errorMessage, setErrorMessage] = useState({});
  const database = useContext(DatabaseContext);

  const handleEnter = (event) => {
    setErrorMessage((prev) => ({
      ...prev,
    password: "",
    admin: "",
  }));
    if (event.key === 'Enter') {
        event.preventDefault();
        handleAccessChange();
    }
};

const handleEnterAdmin = (event) => {
  setErrorMessage((prev) => ({
    ...prev,
  password: "",
  admin: "",
}));
  if (event.key === 'Enter') {
      event.preventDefault();
      handleAddAdmin();
  }
};

const handleEscape = (event) => {
    if (event.key === 'Escape') {
        event.preventDefault();
        props.onClose();
    }
};

  const handleAccessChange = () => {
    const payload = {
      roomName: props.roomName,
      visibility: access,
      password: password,
    }
    props.socket.emit("updateRoom", payload);
  }

  const handleAddAdmin = () => {
    let user = database.find((user) => user.name === admin);
    if (user === undefined) {
      setErrorMessage((prev) => ({
        ...prev,
        admin: "Utilisateur non trouvé.",
    }));
      return;
    }
    const payload = {
      roomName: props.roomName,
      userId: user.id
    }
    props.socket.emit("addRoomAdmin", payload);
  }

  const handleRoomUpdated = useCallback((payload) => {
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
      <div className="RoomCreate-screen-card" onKeyDown={handleEscape}>
          <div className="RoomCreate-screen-card-overlay"></div>
          <div className="RoomCreate-screen-card-content">
              <div className="RoomCreate-screen-card-content-body">
                  <h3 className="Profile-screen-card-title">Paramètre {props.roomName}</h3>
                  <div className="RoomSettings-wrapper">
                      <label htmlFor="inputAccess" className='Profile-screen-card-text'>Visibilité</label>
                      <select name="visibility" className="RoomCreate-screen-card-select" onKeyDown={handleEnter} value={access} onChange={(e) => setAccess(e.target.value)}>
                          <option value="public" className='RoomCreate-screen-card-option'>Public</option>
                          <option value="private" className='RoomCreate-screen-card-option'>Privé</option>
                      </select>
                  </div>
                  <div className="RoomSettings-wrapper">
                      <label htmlFor="inputPassword" className='Profile-screen-card-text'>Mot de passe</label>
                      <input type="text" className="RoomCreate-screen-card-input" name="password" onKeyDown={handleEnter} placeholder="Champ vide pour suppression" value={password} onChange={(e) => setPassword(e.target.value)} />
                      <button className="Settings-button Settings-upload-button" onClick={handleAccessChange}>Modifier</button>
                  </div>
                  {errorMessage.password && (<div className="Settings-error">{errorMessage.password}</div>)}

                  <div className="RoomSettings-wrapper">
                      <label htmlFor="inputAdmin" className='Profile-screen-card-text'>Nouvel administrateur</label>
                      <input type="text" className="RoomCreate-screen-card-input" autoComplete='false' onKeyDown={handleEnterAdmin} name="Name" placeholder="Nom" value={admin} onChange={(e) => setAdmin(e.target.value)} />
                      <div onClick={handleAddAdmin}> <button className='Settings-button Settings-upload-button'>Ajouter</button></div>
                  </div>
                  {errorMessage.admin && (<div className="Settings-error">{errorMessage.admin}</div>)}

              </div>
          </div>
      </div>
  );
};
