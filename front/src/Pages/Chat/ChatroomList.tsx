import React, { FC } from 'react';
import { useState, useEffect, useCallback} from 'react';
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

    const handleRoomCreated = useCallback((payload) => {
      setChatrooms((prevChatrooms) => [...prevChatrooms, payload]);
    }, [chatrooms]);

    const handleRoomDeleted = useCallback((payload) => {
      // console.log("LEAVE", payload);
      setChatrooms((prevChatrooms) => {
        return prevChatrooms.filter((room) => room.roomName !== payload.roomName);
      });
    }, [chatrooms]);

    const handleChatroomClick = (chatroomId)=> {
      props.onListClick(chatroomId);
    }
    const showdata = (event) => {
      if (props.socket) {
        props.socket.emit("getRoomsList");
        props.socket.on("roomsListReceived", (payload) => console.log(`The payload iswww: ${JSON.stringify(payload)}`));
      }
    };

    useEffect(() => {
      if (props.socket) {
        props.socket.on("roomsListReceived", (payload) => {
          console.log(`NEW: ${JSON.stringify(payload)}`);
          setChatrooms(payload.roomsList);
        });
        props.socket.on("roomCreated", handleRoomCreated);
        props.socket.on("roomJoined", handleRoomCreated);
        props.socket.on("roomLeft", handleRoomDeleted );
      return () => {
          // Log the event listeners to the console
          props.socket.off("roomsListReceived", (payload) => {
            console.log(`NEW: ${JSON.stringify(payload)}`);
            setChatrooms(payload.roomsList);
          });
          props.socket.off("roomLeft", handleRoomDeleted);
          props.socket.off("roomJoined", handleRoomCreated);
          // props.socket.off("roomCreated", handleRoomCreated);
      };}
    }, [props.socket, handleRoomDeleted]);


  return (
    <div className="people-list" id="people-list">

            <div className="search">
            <button onClick={showdata}>Data</button>
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
              <li className="clearfix"  key={room.id} onClick={() => handleChatroomClick(room.roomName)}>       
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

