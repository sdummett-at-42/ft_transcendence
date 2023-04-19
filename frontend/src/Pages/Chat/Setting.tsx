import React from 'react';
import { useRef, useEffect } from "react";
import { useState } from 'react';
import { Socket } from "socket.io-client";

import "./chat.scss"
interface SettingProps {
  socket: Socket;
  isVisible: Boolean;
  onClose:() => void;
  footer: React.ReactNode;
}

// export default function Setting( props: SettingProps) {
//   const [formData, setFormData] = useState({
//     roomName: "",
//     visibility: "",
//     password : "",
//   });

//   const handleInputChange = (event) => {
//     const { name, value } = event.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

export default function Setting(props: SettingProps) {

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
            <form>
            <div class="form-group col-md-4">
                <label for="inputAccess">Accessibility</label>
                <select id="inputAccess" className="form-control" required>
                <option selected="selected">Public</option>
                <option >Private</option>
                </select>
            </div>
            <div class="form-group">
                <label for="inputPassword">Password</label>
                <input type="text" className="form-control" id="inputPassword" placeholder="Password" />
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