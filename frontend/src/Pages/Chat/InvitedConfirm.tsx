
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
      alert("Cette salle n'existe pas.");
    } else if (payload.message.includes("invited")) {
      alert("Vous n'êtes pas invité");
    } else if (payload.message.includes("banned")) {
      alert("Tu es banni :(");
    } else if (payload.message.includes("already")) {
      alert("Vous êtes déjà membre de cette salle.");
    } else if (payload.message.includes("full")) {
      alert("Désolé, cette salle est pleine.");
    } else if (payload.message.includes("incorrect")) {
      alert("Le mot de passe est incorrect! essayer à nouveau!");
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
                <h3>Voulez-vous rejoindre la salle de {props.RoomName} ? </h3>
                <label htmlFor="password">Mot de pass</label>
                <input
                  type="password"
                  id="password"
                  placeholder="facultatif"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="modal-form">
                  <button onClick={handleJoinRoom}>Rejoindre</button>
                  <button onClick={props.onClose}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        </div>)}
    </div>

  );
};

