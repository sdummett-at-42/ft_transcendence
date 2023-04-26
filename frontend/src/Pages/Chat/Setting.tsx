import React from 'react';
import { useRef, useEffect, useContext, useCallback } from "react";
import { useState } from 'react';
import { Socket } from "socket.io-client";
import { DatabaseContext } from './ChatLogin';
import "./chat.scss"

import "./chat.scss"
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
    <div className="modal" onClick={props.onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Paramètre{props.roomName}</h3>
          <span className="modal-close" onClick={props.onClose}>
            &times;
          </span>
        </div>
        <div className="modal-body">
          <div className="modal-content">
            <div className="col-md-12 d-flex justify-content-end" onClick={handleAccessChange}><button>Change</button></div>
            <div className="form-group col-md-12">
              <label htmlFor="inputAccess">Accessibilité</label>
              <select name="visibility" className="form-control" value={access} onChange={(e) => setAccess(e.target.value)}>
                <option value="public" >Public</option>
                <option value="private">Privé</option>
              </select>
            </div>
            <div className="form-group col-md-12">
              <label htmlFor="inputPassword">Mot de passe(To remove the password, leave the field empty.)</label>
              <input type="text" className="form-control" name="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="col-md-12 d-flex justify-content-end" onClick={handleAddAdmin}> <button>Ajouter</button></div>
            <div className="col-md-12">
              <label htmlFor="inputAdmin">Nouvel administrateur</label>
              <input type="text" className="form-control" name="Name" placeholder="Name" value={admin} onChange={(e) => setAdmin(e.target.value)} />
            </div>

            <div className="modal-form">
              <button onClick={props.onClose}>Fermer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
