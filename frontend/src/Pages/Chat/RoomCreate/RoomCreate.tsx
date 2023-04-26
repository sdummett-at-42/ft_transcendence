import React from 'react';
import { useRef, useEffect, useCallback } from "react";
import { useState } from 'react';
import "./RoomCreate.css"
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
    <div className="RoomCreate-screen-card">
        <div className="RoomCreate-screen-card-overlay"></div>
          <div className="RoomCreate-screen-card-content">
						  <div className="RoomCreate-screen-card-content-body">
                  <h3 className="Profile-screen-card-title">Créer un salon</h3>
                  <form onSubmit={handleSubmit} className="RoomCreate-screen-card-form-wrapper">
                          <div className="RoomCreate-screen-card-input-wrapper">
                              <label htmlFor="inputChatRoomName" className="Profile-screen-card-text">
                                  Nom du salon
                              </label>
                              <input
                                  type="text"
                                  className="RoomCreate-screen-card-input"
                                  name="roomName"
                                  required
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  autoFocus={true}
                                  autoComplete='off'
                              />
                          </div>
                          <div className="RoomCreate-screen-card-input-wrapper">
                              <label htmlFor="inputAccess" className="Profile-screen-card-text"> 
                                  Accessibilité
                              </label>
                              <select
                                  name="visibility"
                                  className="RoomCreate-screen-card-select"
                                  required
                                  value={formData.visibility}
                                  onChange={handleInputChange}
                              >
                                  <option value="public" className='RoomCreate-screen-card-option'>Public</option>
                                  <option value="private" className='RoomCreate-screen-card-option'>Privé</option>
                              </select>
                          </div>
                          {formData.visibility === "private" && (
                              <div className="RoomCreate-screen-card-input-wrapper">
                                  <label htmlFor="inputPassword" className="Profile-screen-card-text">
                                      Mot de passe
                                  </label>
                                  <input
                                      type="text"
                                      className="RoomCreate-screen-card-input"
                                      name="password"
                                      placeholder="facultatif"
                                      value={formData.password}
                                      onChange={handleInputChange}
                                  />
                              </div>
                          )}
                          <div className="RoomCreate-button-wrapper">
                              <button onClick={props.onClose} className="Settings-button">
                                  Annuler
                              </button>
                              <button type="submit" className='Settings-button'>
                                  Créer
                              </button>
                          </div>
                      </form>
              </div>
          </div>
      </div>
  );
};