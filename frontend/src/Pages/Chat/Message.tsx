import React, { FC } from 'react';
import {messageList} from './data'
import "./chat.css"
import {Socket } from "socket.io-client";
import { useState, useEffect } from 'react';

interface MessageProps {
  socket: Socket;
  selectedList : (list: string) => void;

}

export default function Message(props:MessageProps) {
  const [messages, setMessages] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleJoinRoom = (event) => {
    setShowInput(true);
      // props.socket.emit("joinRoom", payload);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // do something with inputValue
    setShowInput(false);
  };

  useEffect(() => {
    if (props.socket) {
      props.socket.on("roomMsgHistReceived", (payload) => {console.log(`roomMsgHistReceived, : ${JSON.stringify(payload)}`);
      setMessages(payload.msgHist);
    });

    }
  }, [props.socket]);

  const item = messageList.map(each => (
    <div  >
      <p className="text-start my-1">{each.message}</p>
      <small className="text-end">{each.createtime}</small>
    </div>
  ));

  return (
<div className="chat">
<div className="chat-header clearfix">
  <div className="chat-about container">
    <div className="row">
    <div className="chat-with col-2">Chatroom</div>
    {/* <div className="chat-num-messages col-4">1000 members</div> */}
  </div>
  <button className="col-2" onClick={handleJoinRoom} >Join</button>
  <button className="col-2">Leave</button>
  {/* <input type="text" className="form-control" name="password" placeholder="Password" /> */}
  {showInput && (
        <form onSubmit={handleSubmit}>
          <input className="col-10" type="text" placeholder="Password" value={inputValue} onChange={handleInputChange} />
          <button className="col-2" type="submit">Submit</button>
        </form>
      )}
    </div>
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
                    
            <button>Send</button>
    
          </div>
</div>
  );
}