import React, { FC } from 'react';
import {roomList} from './data'


interface ChatroomListProps {}

const ChatroomList: FC<ChatroomListProps> = () => (
  <div >
    {roomList.map(index=>
    <div>{index.chatname}</div>)}
  </div>
);

export default ChatroomList;

// import { useState, useEffect } from 'react';

// export default function ChatroomList(props) {
//   const [chatrooms, setChatrooms] = useState([]);

//   useEffect(() => {
//     // Fetch list of chatrooms
//     fetch('/api/chatrooms')
//       .then(response => response.json())
//       .then(data => setChatrooms(data));
//   }, []);

//   function handleChatroomClick(chatroomId) {
//     props.onChatroomSelect(chatroomId);
//   }

//   return (
//     <div>
//       {chatrooms.map(chatroom => (
//         <div key={chatroom.id} onClick={() => handleChatroomClick(chatroom.id)}>
//           <h2>{chatroom.name}</h2>
//           <p>{chatroom.description}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

