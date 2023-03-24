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
import "./try.scss"

export default function ChatLogin() {
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  function handleChatroomSelect(chatroomId) {
    setSelectedChatroom(chatroomId);
  }

    return (
      <div>
        <div className="containerhere clearfix">
          <div className="row">
          <div className="people-list" id="people-list">
            <div className="search">
            <input type="text" placeholder="search" />
            <i className="fa fa-search"></i>
          </div>
          <ul className="list">
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Vincent Porter</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> online
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_02.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Aiden Chavez</div>
                <div className="status">
                  <i className="fa fa-circle offline"></i> left 7 mins ago
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_03.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Mike Thomas</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> online
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_04.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Erica Hughes</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> online
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_05.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Ginger Johnston</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> online
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_06.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Tracy Carpenter</div>
                <div className="status">
                  <i className="fa fa-circle offline"></i> left 30 mins ago
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_07.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Christian Kelly</div>
                <div className="status">
                  <i className="fa fa-circle offline"></i> left 10 hours ago
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_08.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Monica Ward</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> online
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_09.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Dean Henry</div>
                <div className="status">
                  <i className="fa fa-circle offline"></i> offline since Oct 28
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_10.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Peyton Mckinney</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> online
                </div>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="chat">
          <div className="chat-header clearfix">
            <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01_green.jpg" alt="avatar" />
            
            <div className="chat-about">
              <div className="chat-with">Chat with Vincent Porter</div>
              <div className="chat-num-messages">already 1 902 messages</div>
            </div>
            <i className="fa fa-star"></i>
          </div> 
          
          <div className="chat-history">
            <ul>
              <li className="clearfix">
                <div className="message-data align-right">
                  <span className="message-data-time" >10:10 AM, Today</span> &nbsp; &nbsp;
                  <span className="message-data-name" >Olia</span> <i class="fa fa-circle me"></i>
                </div>
                <div className="message other-message float-right">
                  Hi Vincent, how are you? How is the project coming along?
                </div>
              </li>
              
              <li>
                <div className="message-data">
                  <span className="message-data-name"><i class="fa fa-circle online"></i> Vincent</span>
                  <span className="message-data-time">10:12 AM, Today</span>
                </div>
                <div className="message my-message">
                  Are we meeting today? Project has been already finished and I have results to show you.
                </div>
              </li>
              
              <li className="clearfix">
                <div className="message-data align-right">
                  <span className="message-data-time" >10:14 AM, Today</span> &nbsp; &nbsp;
                  <span className="message-data-name" >Olia</span> <i class="fa fa-circle me"></i>
                  
                </div>
                <div className="message other-message float-right">
                  Well I am not sure. The rest of the team is not here yet. Maybe in an hour or so? Have you faced any problems at the last phase of the project?
                </div>
              </li>
              
              <li>
                <div className="message-data">
                  <span className="message-data-name"><i class="fa fa-circle online"></i> Vincent</span>
                  <span className="message-data-time">10:20 AM, Today</span>
                </div>
                <div className="message my-message">
                  Actually everything was fine. I'm very excited to show this to our team.
                </div>
              </li>
              
              <li>
                <div className="message-data">
                  <span className="message-data-name"><i class="fa fa-circle online"></i> Vincent</span>
                  <span className="message-data-time">10:31 AM, Today</span>
                </div>
                <i className="fa fa-circle online"></i>
                <i className="fa fa-circle online"></i>
                <i className="fa fa-circle online"></i>
              </li>
              
            </ul>
            
          </div>
          
          <div className="chat-message clearfix">
            <textarea name="message-to-send" id="message-to-send" placeholder ="Type your message" rows="3"></textarea>
                    
            <i className="fa fa-file-o"></i> &nbsp;&nbsp;&nbsp;
            <i className="fa fa-file-image-o"></i>
            
            <button>Send</button>
    
          </div>
          
         
        </div>
        <div className="chatinfo">
          <div className="clearfix">
            <button >public</button>
            <button >public</button>
          </div>
          Roomdetail</div>
      </div>
      </div>
    </div>
    );
}



// const ChatLogin: React.FC = () => {
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

// export default ChatLogin;