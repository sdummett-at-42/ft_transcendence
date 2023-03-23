import React, { FC } from 'react';
import {messageList} from './data'
import "./chat.css"
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
    <div  >
      <p className="text-start my-1">{each.message}</p>
      <small className="text-end">{each.createtime}</small>
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
    <div  >
    <div>{item}</div>
    <div className="input-group mb-3">
  <input type="text" className="form-control" placeholder="send a message..." aria-describedby="button-addon2 " />
  <button className="btn btn-outline-secondary" type="button" id="button-addon2">Send</button>
</div>
    </div>
  );
}
