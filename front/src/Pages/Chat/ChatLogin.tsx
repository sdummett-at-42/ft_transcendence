// npx generate-react-cli component new
//import { connect } from "react-redux";
import React from "react";
import { useState , useEffect } from 'react';
import { io, Socket } from "socket.io-client";
import ChatroomList from "./ChatroomList";
//import ChatroomDetail from './ChatroomDetail';
import Message from './Message';
import RoomDetail from "./RoomDetail";
import "./chat.css"
import "./chat.scss"
import Cookies from 'js-cookie';


export default function ChatLogin() {
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  function handleChatroomSelect(chatroomId) {
    setSelectedChatroom(chatroomId);
  }
  const [socket, setSocket] = useState<Socket | null>(null);


  function getRoomsList() {
    console.log("hello?00\n");
    if (socket) {
      socket.emit("getRoomsList");
      console.log("hello?\n");
    }
  }

  useEffect(() => {
    console.log(`before`)
    
    const connectCookie = Cookies.get('connect.sid');
    console.log(connectCookie);
    const myCookie = document.cookie
  .split('; ')
  .find(row => row.startsWith('connect.sid='))
  ?.split('=')[1];

    console.log(Cookies);
    console.log(document.cookie)
    console.log(`connectCOokie: ${connectCookie}`)
    // Create a new WebSocket connection using socket.io-client
    const newSocket = io("ws://localhost:3001",{
      extraHeaders: {
        Cookie: `connect.sid=${connectCookie}`
       }} );
    

    // Set up the event listeners for the WebSocket
    newSocket.on("connect", () => {
      console.log("WebSocket connection established!");
      
      getRoomsList();
    });

    newSocket.on("message", (data) => {
      console.log(`Received message: ${data}`);
    });

    newSocket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    newSocket.on("disconnect", () => {
      console.log("WebSocket connection closed.");
    });
    newSocket.on("roomsListReceived", (payload) => console.log(JSON.stringify(payload)));
    setSocket(newSocket);

    // Save the WebSocket instance to the state
   
    // const fetchData = async () => {
    //   const response = await fetch("http://localhost:3001/users/1");
    //   const data = await response.json();
    //   setData(data);
    // };

    // fetchData();
    // Clean up the WebSocket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);



    return (
      <div >
        <div className="containerhere clearfix">
          <div className="row">
          <ChatroomList socket={socket} />
          <Message />
          <RoomDetail />
      </div>
      </div>
    </div>
    );
};
