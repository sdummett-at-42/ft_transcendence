import React, { FC } from 'react';
import {messageList} from './data'
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

  const item = messageList.map(each => (
    <div >
      <p>{each.message}</p>
      <p>{each.timestamp}</p>
    </div>
  ));

  // useEffect(() => {
  //   if (props.chatroomId) {
  //     // Fetch messages for the selected chatroom
  //     fetch(`/api/chatrooms/${props.chatroomId}/messages`)
  //       .then(response => response.json())
  //       .then(data => setMessages(data));
  //   }
  // }, [props.chatroomId]);

  return (
    <div data-bs-spy="scroll" data-bs-target="#navbar-example2" data-bs-root-margin="0px 0px -40%" data-bs-smooth-scroll="true" className="scrollspy-example bg-body-tertiary p-3 rounded-2" tabindex="0">
    <div>{item}</div>
    <input></input>
    </div>
  );
}
