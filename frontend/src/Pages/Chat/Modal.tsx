import React from 'react';
import { useRef, useEffect, useCallback } from "react";
import { useState } from 'react';
import "./chat.scss"
import { Socket } from "socket.io-client";

interface ModalProps {
  socket: Socket;
  isVisible: Boolean;
  onClose:() => void;
  footer: React.ReactNode;
}

export default function Modal(props: ModalProps) {
    const [formData, setFormData] = useState({
      roomName: "",
      visibility: "public",
      password : "",
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
      if (props.socket) {
        props.socket.on("roomCreated", handleCloseAfterRoomCreated);
        props.socket.on("roomNotCreated", () => {
          console.log("roomNotCreated");
          alert("The room name already exists.");
        });
      }
      return () => {
        if (props.socket) {
          props.socket.off('roomCreated', handleCloseAfterRoomCreated);
          props.socket.off('roomNotCreated');
        }
      };
    }, [props.socket]);

    return !props.isVisible ? null: (
      <div className="modal" onClick={props.onClose}>
        <div className="modal-dialog" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">Create a new Chat Room</h3>
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
                <label htmlFor="inputAccess">Accessibility</label>
                <select name="visibility" className="form-control" required  value={formData.visibility} onChange={handleInputChange}>
                <option value="public" >Public</option>
                <option value="private">Private</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="inputPassword">Password</label>
                <input type="text" className="form-control" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} />
            </div>
            {/* <div class="form-group">
                <label htmlFor="inputInvitefriend">Invite your friend</label>
                <input type="text" className="form-control" id="inputInviteFriend" placeholder="Name" />
            </div> */}
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          </div>
          </div>
          {props.footer && <div className="modal-footer">{props.footer}</div>}
        </div>
      </div>
    );
  };