import React from 'react';
import { useRef, useEffect, useContext } from "react";
import { useState } from 'react';
import { Socket } from "socket.io-client";
import { DatabaseContext } from './ChatLogin';

import "./chat.scss"
interface SettingProps {
  socket: Socket,
  isVisible: Boolean,
  onClose:() => void,
  roomName :string,
  onUpdate:() =>void;

}

export default function Setting(props: SettingProps) {
  const [access, setAccess] = useState("public");
  const [password, setPassword]=useState("");
  const [admin, setAdmin]= useState("");
  const database = useContext(DatabaseContext);

  const handleAccessChange = ()=>{
    const payload = {
      roomName : props.roomName,
      visibility :access,
      password : password,
    }
    props.socket.emit("updateRoom", payload);
  }

  const handleAddAdmin = ()=>{
    let user = database.find((user) => user.name === admin);
    if (user  === undefined){
      alert("User not found. Please try again.");
      return ;
    }
    console.log("user", user);
    const payload = {
      roomName : props.roomName,
      userId : user.id
    }
    props.socket.emit("addRoomAdmin", payload);
  }

  useEffect(() => {
    if (props.socket) {
      props.socket.on("roomAdminAdded", (payload) => {
        // console.log("roomAdminAdded", payload);
      })
      props.socket.on("roomAdminNotAdded",(payload) =>{
        alert(payload.message);
      })
      props.socket.on("roomUpdated",
        props.onClose());
      props.socket.on("roomNotUpdated", (payload) => {
        console.log("roomNotUpdated", payload);
        alert(payload.message);
      });
    }
    return () => {
      if (props.socket) {
        props.socket.off("roomAdminAdded");
        props.socket.off("roomAdminNotAdded");
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
              <div className=" d-flex justify-content-end" onClick={handleAddAdmin}> <button>Add</button></div>
            <div className="modal-form">
            <button onClick={props.onClose}>Close</button>
              </div>
              </div>
          </div>
          </div>
        </div>
      </div>
    );
  };