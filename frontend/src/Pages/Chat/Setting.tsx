import React from 'react';
import { useRef, useEffect } from "react";
import { useState } from 'react';
import { Socket } from "socket.io-client";

import "./chat.scss"
interface SettingProps {
  socket: Socket,
  isVisible: Boolean,
  onClose:() => void,
  roomName :string,

}

export default function Setting(props: SettingProps) {
  const [access, setAccess] = useState("public");
  const [password, setPassword]=useState("");
  const [admin, setAdmin]= useState("");

  const handleAccessChange = ()=>{
    const payload = {
      roomName : props.roomName,
      visibility :access,
      password : password,
    }
    props.socket.emit("updateRoom", payload);
  }

  useEffect(() => {
    if (props.socket) {
      props.socket.on("roomUpdated",
        props.onClose()
      );
      props.socket.on("roomNotUpdated", (payload) => {
        console.log("roomNotUpdated");
        alert(payload.message);
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
            <h3 className="modal-title">Setting:{props.roomName}</h3>
            <span className="modal-close" onClick={props.onClose}>
              &times;
            </span>
          </div>
          <div className="modal-body">
            <div className="modal-content">
              <div className="row">
                <div className ="col-8">
                <label htmlFor="inputAccess">Accessibility</label>
                <select name="visibility" className="form-control" value={access} onChange={(e) => setAccess(e.target.value)}>
                <option value="public" >Public</option>
                <option value="private">Private</option>
                </select>
                </div>
            <div className="col-8">
                <label htmlFor="inputPassword">Password </label>
                <label htmlFor="inputPassword">(To remove the password, leave the field empty.)</label>
                <input type="text" className="form-control" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="d-flex justify-content-end" onClick={handleAccessChange}><button>Change</button></div>
            <div className="col-8">
                <label htmlFor="inputAdmin">New Administrator</label>
                <input type="text" className="form-control" name="Name" placeholder="Name" value={admin} onChange={(e) => setAdmin(e.target.value)} />
              </div>
              <div className=" d-flex justify-content-end"> <button>Add</button></div>
            <div className="modal-form">
            <button onClick={props.onClose}>Cancel</button>
              </div>
              </div>
          </div>
          </div>
        </div>
      </div>
    );
  };