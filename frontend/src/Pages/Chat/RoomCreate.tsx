import React from 'react';
import { useRef, useEffect, useCallback } from "react";
import { useState } from 'react';
import "./chat.scss"
import { Socket } from "socket.io-client";

interface RoomCreatProps {
  socket: Socket;
  isVisible: Boolean;
  onClose: () => void;
}

export default function RoomCreate(props: RoomCreatProps) {
  const [formData, setFormData] = useState({
    roomName: "",
    visibility: "public",
    password: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("test")
    props.socket.emit("createRoom", formData);
  };

  const handleCloseAfterRoomCreated = useCallback((payload) => {
    props.onClose()
  }, []);
  const handleAlertmessage = useCallback((payload) => {
    alert(payload.message);
}, [])

  useEffect(() => {
    if (props.socket) {
      props.socket.on("roomCreated", handleCloseAfterRoomCreated);
      props.socket.on("roomNotCreated", handleAlertmessage);
    }
    return () => {
      if (props.socket) {
        props.socket.off('roomCreated', handleCloseAfterRoomCreated);
        props.socket.off('roomNotCreated',handleAlertmessage);
      }
    };
  }, [props.socket, handleCloseAfterRoomCreated,handleAlertmessage]);

  return !props.isVisible ? null : (
    <div className="modal" onClick={props.onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Nouveau Salon</h3>
          <span className="modal-close" onClick={props.onClose}>
            &times;
          </span>
        </div>
        <div className="modal-body">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="inputChatRoomName">Nom de le salon</label>
                <input type="text" className="form-control" name="roomName" placeholder="Nom" required value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group col-md-4">
                <label htmlFor="inputAccess">Accessibilité</label>
                <select name="visibility" className="form-control" required value={formData.visibility} onChange={handleInputChange}>
                  <option value="public" >Public</option>
                  <option value="private">Privé</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="inputPassword">Mot de passe</label>
                <input type="text" className="form-control" name="password" placeholder="facultatif" value={formData.password} onChange={handleInputChange} />
              </div>
              <div className="modal-form">
                <button type="submit">Envoyer</button>
                <button onClick={props.onClose}>Annuler</button>
              </div>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
};