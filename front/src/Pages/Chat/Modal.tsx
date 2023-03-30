import React from 'react';
import { useRef, useEffect } from "react";
import { useState } from 'react';

import "./chat.scss"

export default function Modal({ isVisible, title, content, footer, onClose }) {
    // const keydownHandler = ({ key }) => {
    //     console.log("This one gets called because of the button click");
    //   switch (key) {
    //     case 'Escape':
    //       onClose();
    //       break;
    //     default:
    //   }
    // };
  
    // useEffect(() => {
    //   document.addEventListener('keydown', keydownHandler);
    //   return () => document.removeEventListener('keydown', keydownHandler);
    // });
  
    return !isVisible ? null: (
      <div className="modal" onClick={onClose}>
        <div className="modal-dialog" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">Create a new Chat Room</h3>
            <span className="modal-close" onClick={onClose}>
              &times;
            </span>
          </div>
          <div className="modal-body">
            <div className="modal-content">
            <form>
            <div class="form-group">
                <label for="inputChatRoomName">Chat Room Name</label>
                <input type="text" className="form-control" id="nputChatRoomName" placeholder="Name" required />
            </div>
            <div class="form-group col-md-4">
                <label for="inputAccess">Accessibility</label>
                <select id="inputAccess" className="form-control" required>
                <option selected="selected">Public</option>
                <option >Private</option>
                </select>
            </div>
            <div class="form-group">
                <label for="inputPassword">Password</label>
                <input type="text" className="form-control" id="inputPassword" placeholder="..." />
            </div>
            <div class="form-group">
                <label for="inputInvitefriend">Invite your friend</label>
                <input type="text" className="form-control" id="inputInviteFriend" placeholder="Name" />
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
          </form>
          </div>
          </div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    );
  };