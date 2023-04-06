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
    // States
    const [chatrooms, setChatrooms] = useState([]);
    const [show, setShow] = useState(false);

    // Event handlers
    const handleRoomCreated = useCallback((payload) => {
      console.log("created");
    }, []);

    const handleRoomJoined = useCallback((payload) => {
      console.log("joined");
      setChatrooms((prevChatrooms) => [...prevChatrooms, {protected: false, roomName: payload.roomName}]);
    }, []);

    const handleRoomsListReceived = useCallback((payload) => {
      console.log(`NEW: ${JSON.stringify(payload)}`);
      setChatrooms(payload.roomsList);
    }, []);

    const handleRoomDeleted = useCallback((payload) => {
      // console.log("LEAVE", payload);
      setChatrooms((prevChatrooms) => {
        return prevChatrooms.filter((room) => room.roomName !== payload.roomName);
      });
    }, []);

    // Render handlers
    const handleChatroomClick = (chatroomId)=> {
      props.onListClick(chatroomId);
    }
    const showdata = (event) => {
      if (props.socket) {
        props.socket.emit("getRoomsList");
      }
    };

    // Init
    useEffect(() => {
      if (props.socket) {
        console.log("The socket exists")
        props.socket.on("roomsListReceived",handleRoomsListReceived);
        props.socket.on("roomCreated", handleRoomCreated);
        props.socket.on("roomJoined", handleRoomJoined);
        props.socket.on("roomLeft", handleRoomDeleted );
        console.log("received");
        console.log(props.socket.listeners("roomsListReceived"));
        console.log("created");
        console.log(props.socket.listeners("roomCreated"));
        console.log("joined");
        console.log(props.socket.listeners("roomJoined"));
        console.log("left");
        console.log(props.socket.listeners("roomLeft"));
        console.log("fake");
        console.log(props.socket.listeners("fakeEvent"));
      return () => {
          // Log the event listeners to the console
          props.socket.off("roomsListReceived", handleRoomsListReceived);
          props.socket.off("roomCreated", handleRoomCreated);
          props.socket.off("roomJoined", handleRoomJoined);
          props.socket.off("roomLeft", handleRoomDeleted);
      }}
    }, [props.socket, handleRoomDeleted, handleRoomCreated, handleRoomJoined, handleRoomsListReceived]);

  // Render
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
              <li className="clearfix"  key={room.roomName} onClick={() => handleChatroomClick(room.roomName)}>       
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

