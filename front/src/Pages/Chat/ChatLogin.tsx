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

export default function ChatLogin() {
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  function handleChatroomSelect(chatroomId) {
    setSelectedChatroom(chatroomId);
  }

    return (
      <div >
        <div className="containerhere clearfix">
          <div className="row">
          <ChatroomList />
          <Message />
          <RoomDetail />
      </div>
      </div>
    </div>
    );
}



// const ChatLogin: React.FC = () => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     // Create a new WebSocket connection using socket.io-client
//     const newSocket = io("ws://localhost:3001");
    

//     // Set up the event listeners for the WebSocket
//     newSocket.on("connect", () => {
//       console.log("WebSocket connection established!");
//     });

//     newSocket.on("message", (data) => {
//       console.log(`Received message: ${data}`);
//     });

//     newSocket.on("error", (error) => {
//       console.error("WebSocket error:", error);
//     });

//     newSocket.on("disconnect", () => {
//       console.log("WebSocket connection closed.");
//     });

//     // Save the WebSocket instance to the state
//     setSocket(newSocket);

//     const fetchData = async () => {
//       const response = await fetch("http://localhost:3001/users/1");
//       const data = await response.json();
//       setData(data);
//     };

//     fetchData();

//     // Clean up the WebSocket connection when the component unmounts
//     return () => {
//       console.log(data);
//       newSocket.disconnect();
//     };
//   }, []);

//   return (        <div> {data ? (
//     <ul>
//       {data.map((friend: any) => (
//         <li key={friend.id}>{friend.name}</li>
//       ))}
//     </ul>
//   ) : (
//     <p>Loading...</p>
//   )}

//             </div>)
// };

// export default ChatLogin;