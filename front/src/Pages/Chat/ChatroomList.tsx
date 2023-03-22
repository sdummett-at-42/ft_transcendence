import React, { FC } from 'react';
import {roomList} from './data'
import { useState, useEffect } from 'react';

export default function ChatroomList(props) {
  const [chatrooms, setChatrooms] = useState([]);

  // useEffect(() => {
  //   // Fetch list of chatrooms
  //   fetch('/api/chatrooms')
  //     .then(response => response.json())
  //     .then(data => setChatrooms(data));
  // }, []);

  function handleChatroomClick(chatroomId) {
    props.onChatroomSelect(chatroomId);
  }

  return (
    <div>
      {roomList.map(chatroom => (
        <div key={chatroom.id} onClick={() => handleChatroomClick(chatroom.id)}>
          <a href="#" class="list-group-item list-group-item-action">
            <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{chatroom.chatname}</h5>
            <small class="text-muted">3 days ago</small>
            </div>
            <small class="text-muted">Last message.</small>
          </a>
          <h2></h2>
          <p></p>
        </div>
      ))}
    </div>
  );
}

