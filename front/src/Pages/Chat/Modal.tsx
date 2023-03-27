import React from 'react';
import { useRef, useEffect } from "react";
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
            <h3 className="modal-title">{title}</h3>
            <span className="modal-close" onClick={onClose}>
              &times;
            </span>
          </div>
          <div className="modal-body">
            <div className="modal-content">{content}</div>
            <form>
            <div class="form-group">
                <label for="inputChatRoomName">Chat Roon Name</label>
                <input type="text" className="form-control" id="nputChatRoomName" placeholder="" />
            </div>
            <div class="form-group">
                <label for="inputPassword">Password</label>
                <input type="text" className="form-control" id="inputAddress" placeholder="" />
            </div>
            <div class="form-group col-md-4">
                <label for="inputAccess">Accessibility</label>
                <select id="inputAccess" className="form-control">
                <option selected>Public</option>
                <option >Pretected</option>
                <option >Private</option>
                </select>
            </div>
            <div class="form-group">
                <label for="inputInvitefriend">Invite your friend</label>
                <input type="text" className="form-control" id="inputAddress" placeholder="" />
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
          </form>
          </div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    );
  };