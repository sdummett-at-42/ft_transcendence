import React from 'react';
import { useRef, useEffect, useCallback } from "react";
import { useState } from 'react';
import "./chat.scss"
import { Socket } from "socket.io-client";

interface ProfilePopupProps {
  isVisible: Boolean;
  onClose: () => void;
  UserId :Number
}

export default function ProfilePopup(props: ProfilePopupProps) {


  const handleCloseAfterRoomCreated = useCallback((payload) => {
    props.onClose()
  }, []);

  useEffect(() => {
    ;
  }, []);

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
        
              <div className="modal-form">
                <button>More info..</button>
                <button onClick={props.onClose}>Cancel</button>
              </div>


          </div>
        </div>
      </div>
    </div>
  );
};