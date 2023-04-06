import React from 'react';
import { useRef, useEffect } from "react";
import { useState } from 'react';
import { Socket } from "socket.io-client";

import "./chat.scss"
interface SettingProps {
  socket: Socket,
  isVisible: Boolean,
  onClose:() => void,
  footer: React.ReactNode,
  selectedList :string,

}

export default function Setting(props: SettingProps) {
  const [formData, setFormData] = useState({
    roomName: props.selectedList,
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
    console.log("chaning :",props.selectedList);
    props.socket.emit("updateRoom", formData);
  };

  useEffect(() => {
    if (props.socket) {
      props.socket.on("roomUpdated",
        props.onClose()
      );
      props.socket.on("roomNotUpdated", () => {
        console.log("roomNotUpdated");
        alert("roomNotUpdated");
      });
    }
    return () => {
      if (props.socket) {
        props.socket.off('roomUpdated');
        props.socket.off('roomNotUpdated');
      }
    };
  }, [props.socket]);
    return !props.isVisible ? null: (
      <div className="modal" onClick={props.onClose}>
        <div className="modal-dialog" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">Setting</h3>
            <span className="modal-close" onClick={props.onClose}>
              &times;
            </span>
          </div>
          <div className="modal-body">
            <div className="modal-content">
            <form onSubmit={handleSubmit}>
            <div class="form-group col-md-4">
                <label for="inputAccess">Accessibility</label>
                <select name="visibility" className="form-control" required  value={formData.visibility} onChange={handleInputChange}>
                <option value="public" >Public</option>
                <option value="private">Private</option>
                </select>
            </div>
            <div className="form-group">
                <label for="inputPassword">Password</label>
                <input type="text" className="form-control" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} />
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
          </form>
          </div>
          </div>
          {props.footer && <div className="modal-footer">{props.footer}</div>}
        </div>
      </div>
    );
  };