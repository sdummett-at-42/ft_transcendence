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
//     <div  >
//     <div>{item}</div>
//     <div className="input-group mb-3">
//   <input type="text" className="form-control" placeholder="send a message..." aria-describedby="button-addon2 " />
//   <button className="btn btn-outline-secondary" type="button" id="button-addon2">Send</button>
// </div>
//     </div>
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
  );
}
