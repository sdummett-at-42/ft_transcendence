import React, { FC } from 'react';
//import styles from './Message.module.css';

// interface MessageProps {}

// const Message: FC<MessageProps> = () => (
//   <div className={styles.Message}>
//     Message Component
//   </div>
// );
import { useState, useEffect } from 'react';

export default function Message(props) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (props.chatroomId) {
      // Fetch messages for the selected chatroom
      fetch(`/api/chatrooms/${props.chatroomId}/messages`)
        .then(response => response.json())
        .then(data => setMessages(data));
    }
  }, [props.chatroomId]);

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          <p>{message.text}</p>
          <p>{message.timestamp}</p>
        </div>
      ))}
    </div>
  );
}

//export default Message;
