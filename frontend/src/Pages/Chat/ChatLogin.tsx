import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import { useState , useEffect } from 'react';
import { Socket } from "socket.io-client";
import ChatroomList from "./ChatroomList";
import Message from './Message';
import RoomDetail from "./RoomDetail";
import "./chat.css"
import "./chat.scss"
import { connectSocket , disconnectSocket } from "./Socket";


export default function ChatLogin() {
  const [socket, setSocket] = useState<Socket>();
  const [selectedList, setSelectedList] = useState(null);

  const handleListClick = (list) => {
    console.log("List:",list);
    setSelectedList(list);
    const payload = {
      roomName: selectedList,
    }
    socket.emit("getRoomMsgHist", payload);
  }

  useEffect(() => {
    const socket = connectSocket();
    setSocket(socket);
    socket.emit("getRoomsList");
    return () => {
      disconnectSocket();
    };
  }, []);

    return (
      <div >
        <div className="containerhere clearfix">
          <div className="row">
          <ChatroomList socket={socket}  onListClick={handleListClick} />
          {/* <Message socket={socket} selectedList={selectedList} />
          <RoomDetail socket={socket} selectedList={selectedList}/> */}
      </div>
      </div>
    </div>
    );
};
