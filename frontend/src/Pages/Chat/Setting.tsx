import React from 'react';
import { useRef, useEffect } from "react";
import { useState } from 'react';
import { Socket } from "socket.io-client";

import "./chat.scss"
interface SettingProps {
  socket: Socket,
  isVisible: Boolean,
  onClose:() => void,
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
            <h3 className="modal-title">Setting:{props.selectedList}</h3>
            <span className="modal-close" onClick={props.onClose}>
              &times;
            </span>
          </div>
          <div className="modal-body">
            <div className="modal-content">
            <form onSubmit={handleSubmit}>
            <div className ="form-group col-md-4">
                <label htmlFor="inputAccess">Accessibility</label>
                <select name="visibility" className="form-control" required  value={formData.visibility} onChange={handleInputChange}>
                <option value="public" >Public</option>
                <option value="private">Private</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="inputPassword">Password (To remove the password, simply leave the password field blank.)</label>
                <input type="text" className="form-control" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} />
            </div>
            <div className="form-group">
                <label htmlFor="inputAdmin">New Administrator</label>
                <input type="text" className="form-control" name="Name" placeholder="Name"  />
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