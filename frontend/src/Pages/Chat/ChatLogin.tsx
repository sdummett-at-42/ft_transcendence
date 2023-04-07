import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import { useState , useEffect } from 'react';
import ChatroomList from "./ChatroomList";
import Message from './Message';
import RoomDetail from "./RoomDetail";
import "./chat.css"
import "./chat.scss"
import { socket } from "./Socket";

export default function ChatLogin() {
  const [selectedList, setSelectedList] = useState(null);
  const handleListClick = (list) => {
    console.log("List:",list);
    setSelectedList(list);
    const payload = {
      roomName: selectedList,
    }
    socket.emit("getRoomMsgHist", payload);
  }
  const handleLeaveRoom = () => {
      const confirmed = window.confirm("Are you sure you want leave this room?");
      if (confirmed) {
        console.log("good bye~~~~", selectedList);
        const payload = {
          roomName : selectedList,
        }
        socket.emit("leaveRoom", payload);
        setSelectedList("");
      }
  };
    useEffect(() => {
      function onConnect(payload) {
        console.log("connected socket!");
      }
  
      function onDisconnect() {
        console.log("connected socket NOT");
      }
  
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
  
      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
      };
    }, [socket]);

    if (!socket) {
      return <div>Connecting to server...</div>;
    } else {
    return (
      <div >
        <div className="containerhere clearfix">
          <div className="row">
          <ChatroomList socket={socket}  onListClick={handleListClick} />
          <Message socket={socket} selectedList={selectedList} onQuit={handleLeaveRoom} />
          <RoomDetail socket={socket} selectedList={selectedList}/>
      </div>
      </div>
    </div>
    );
  }
};
