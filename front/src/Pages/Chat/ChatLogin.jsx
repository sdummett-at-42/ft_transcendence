// npx generate-react-cli component new
//import { connect } from "react-redux";
import React from "react";
import { useState } from 'react';
import ChatroomList from "./ChatroomList";
//import ChatroomDetail from './ChatroomDetail';
import Message from './Message';

export default function ChatLogin() {
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  function handleChatroomSelect(chatroomId) {
    setSelectedChatroom(chatroomId);
  }

    return (
        <div className="container text-center" style={{
          backgroundColor: 'white',
          color: 'black'
        }}>
          <div className="row gx-5">
              <div className="col vh-100"><ChatroomList onChatroomSelect={handleChatroomSelect}/>
              <li >
                <button onClick={() => console.log("hihi")}>test</button>
              </li></div>
              <div className="col-6 vh-100"><Message chatroomId={selectedChatroom} /></div>
              <div className="col vh-100">ChatroomDetail</div>

          </div>
        </div>
    );
}