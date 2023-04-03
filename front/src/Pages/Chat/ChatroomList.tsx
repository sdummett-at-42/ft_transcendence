import React, { FC } from 'react';
import { useState, useEffect } from 'react';
import Modal from "./Modal";
import { io, Socket } from "socket.io-client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock} from '@fortawesome/free-solid-svg-icons';

interface ChatroomListProps {
  socket: Socket;
  onListClick : (list: string) => void;
}
export default function ChatroomList(props: ChatroomListProps) {
  const [chatrooms, setChatrooms] = useState([]);
  const [show, setShow] = useState(false);
    const close = () => {
      setShow(false);
    };
    useEffect(() => {
      if (props.socket) {
        props.socket.on("roomsListReceived", (payload) => {console.log(`roomsListReceived: ${JSON.stringify(payload)}`);
        setChatrooms(payload.roomsList);
      });
        props.socket.on("roomJoined", (payload) => {console.log(`roomJoined: ${JSON.stringify(payload)}`);
        // setChatrooms(payload);
      });
      }
    }, [props.socket]);
    function handleChatroomClick(chatroomId) {
      props.onListClick(chatroomId);
    }

  return (
    <div className="people-list" id="people-list">
            <div className="search">
            <button  onClick={() => {
          setShow(true);}} >Create a New ChatRoom</button>
          <Modal         isVisible={show}
            footer={<button>Cancel</button>}
            onClose={() => setShow(false)} 
            socket={props.socket}/>
            </div>
          <ul className="list">
            <li className="clearfix">       
              <div className="about">
                <div className="name">Group A</div>
                <div className="status"> Private <FontAwesomeIcon icon={faLock} /></div>
                
              </div>
            </li>
            {chatrooms.map(room => (
              <li className="clearfix"  key={room.id} onClick={() => handleChatroomClick(room.id)}>       
              <div className="about">
              <div className="name" >{room.roomName} </div>
              <div className="status">
                  <i className="fa fa-circle online"></i> online
                  </div>
              </div>
            </li>
            ))}
          </ul>
        </div>
  );
}

