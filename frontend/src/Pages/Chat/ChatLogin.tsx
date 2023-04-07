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
  const [isConnected, setIsConnected] = useState(socket.connected);
  const handleListClick = (list) => {
    console.log("List:",list);
    setSelectedList(list);
    const payload = {
      roomName: selectedList,
    }
    socket.emit("getRoomMsgHist", payload);
  }
    useEffect(() => {
      function onConnect() {
        setIsConnected(true);
        console.log("connected socekt!");
      }
  
      function onDisconnect() {
        setIsConnected(false);
        console.log("connected socekt not");
      }
  
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
  
      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
      };
    }, []);

    if (!socket) {
      return <div>Connecting to server...</div>;
    } else {
    return (
      <div >
        <div className="containerhere clearfix">
          <div className="row">
          <ChatroomList socket={socket}  onListClick={handleListClick} />
          {/* {selectedList ? <RoomDetail socket={socket} selectedList={selectedList} /> : <Message socket={socket} selectedList={selectedList} />} */}
          <Message socket={socket} selectedList={selectedList} />
          <RoomDetail socket={socket} selectedList={selectedList}/>
      </div>
      </div>
    </div>
    );
  }
};
