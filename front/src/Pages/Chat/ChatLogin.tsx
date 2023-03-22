// npx generate-react-cli component new
//import { connect } from "react-redux";
import React from "react";
import { useState , useEffect } from 'react';
import { io, Socket } from "socket.io-client";
import ChatroomList from "./ChatroomList";
//import ChatroomDetail from './ChatroomDetail';
import Message from './Message';

export default function ChatLogin() {
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  function handleChatroomSelect(chatroomId) {
    setSelectedChatroom(chatroomId);
  }

    return (
        <div className="container text-center " >
          <div className="row gx-5">
              <div className="col vh-100" class="list-group">
              <div class="input-group mb-3">
              <input type="text" class="form-control" placeholder="New Room's name" aria-describedby="button-addon2" />
              <button class="btn btn-outline-secondary" type="button" id="button-addon2" onClick={() => console.log("hihi")}>+</button>
              </div >
              <ChatroomList onChatroomSelect={handleChatroomSelect}/>
              </div>
              <div className="col-6 vh-100"><Message chatroomId={selectedChatroom} /></div>
              <div className="col vh-100">ChatroomDetail</div>

          </div>
        </div>
    );
}



// const ChatRoom: React.FC = () => {
//   const [socket, setSocket] = useState<Socket | null>(null);

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

//     // Clean up the WebSocket connection when the component unmounts
//     return () => {
//       newSocket.disconnect();
//     };
//   }, []);

//   return (        <div> HELLO!
//             </div>)
// };

// export default ChatRoom;