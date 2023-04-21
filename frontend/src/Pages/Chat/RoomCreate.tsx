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

  useEffect(() => {
    if(props.socket){
      props.socket.on("roomCreated", handleCloseAfterRoomCreated);
      props.socket.on("roomNotCreated", (payload) => {
        alert(payload.message);
      });
    }
    return () => {
      if (props.socket) {
        props.socket.off('roomCreated', handleCloseAfterRoomCreated);
        props.socket.off('roomNotCreated');
      }
    };
  }, [props.socket, handleCloseAfterRoomCreated]);

  return !props.isVisible ? null : (
    <div className="modal" onClick={props.onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">New Room</h3>
          <span className="modal-close" onClick={props.onClose}>
            &times;
          </span>
        </div>
        <div className="modal-body">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="inputChatRoomName">Chat Room Name</label>
                <input type="text" className="form-control" name="roomName" placeholder="Name" required value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group col-md-4">
                <label htmlFor="inputAccess">Accessibility:</label>
                <select name="visibility" className="form-control" required value={formData.visibility} onChange={handleInputChange}>
                  <option value="public" >Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="inputPassword">Password</label>
                <input type="text" className="form-control" name="password" placeholder="Optional" value={formData.password} onChange={handleInputChange} />
              </div>
              <div className="modal-form">
                <button type="submit">Submit</button>
                <button onClick={props.onClose}>Cancel</button>
              </div>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
};