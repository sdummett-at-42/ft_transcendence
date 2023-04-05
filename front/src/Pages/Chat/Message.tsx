import React, { FC } from 'react';
import {messageList} from './data'
import "./chat.css"
import {Socket } from "socket.io-client";
import { useState, useEffect, useCallback } from 'react';

interface MessageProps {
  socket: Socket;
  selectedList : (list: string) => void;

}
export default function Message(props:MessageProps) {
  const [messageList, setMessageList] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage]= useState("");
  const [ifShowMessage, setIfShowMessage] = useState(false);

  const handleJoinRoom = (event) => {
    setShowInput(true);
    console.log("selectedList", props.selectedList);
    const payload = {
      roomName : props.selectedList,
      password : inputValue
    }
    props.socket.emit("joinRoom", payload);
  };
  const handleLeaveRoom = (event) => {
    const confirmed = window.confirm("Are you sure you want leave this room?");
    if (confirmed) {
      console.log("good bye~~~~", props.selectedList);
      const payload = {
        roomName : props.selectedList,
      }
      props.socket.emit("leaveRoom", payload);
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleJoinSubmit = (event) => {
    event.preventDefault();
    setShowInput(false);
  };
  const handleSendMessage = (event) =>{
    console.log("SEND~~~~");
    const payload = {
      roomName: props.selectedList,
      message: message,
    }
    props.socket.emit("sendRoomMsg",payload);
  };

  const handleMessages = useCallback((payload) => {
    console.log("payload", payload);
    console.log("messageList", messageList);
    setMessageList((prevme) => [...prevme, payload]);
  },[messageList]);

  const item = messageList.map((each) => {
    const date = new Date(each.timestamp);
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    if (props.selectedList == null) {
      return null;
    }
    return (
      <li>
        <div className="message-data">
          <span className="message-data-name"> From : {each.userId}</span>
          <span className="message-data-time">{hour}:{minute}:{second}</span>
        </div>
        <div className="message my-message">{each.message}</div>
      </li>
    );
  });
  

  useEffect(() => {
    if (props.socket) {
      props.socket.on("roomMsgHistReceived", (payload) => {console.log(`roomMsgHistReceived, : ${JSON.stringify(payload)}`);
      setMessageList(payload.msgHist);
      console.log("payload.msgHist", payload.msgHist);
    });
      props.socket.on("roomJoined", ()=>{
        console.log ("roomJoined\n");
    });
      props.socket.on("roomMsgReceived", handleMessages);
    }
    return () => {
      if (props.socket) {
        props.socket.off("roomMsgHistReceived");
        props.socket.off("roomJoined");
        props.socket.off("roomMsgReceived", handleMessages);
      }
    };
  }, [props.socket]);

  return (
<div className="chat">
<div className="chat-header clearfix">
  <div className="chat-about container">
    <div className="row">
    <div className="chat-with col-2">Chatroom : {props.selectedList}</div>
    {/* <div className="chat-num-messages col-4">1000 members</div> */}
  </div>
  <button className="col-2" onClick={handleJoinRoom} >Join</button>
  <button className="col-2" onClick={handleLeaveRoom}>Leave</button>
  {/* <input type="text" className="form-control" name="password" placeholder="Password" /> */}
  {showInput && (
        <form onSubmit={handleJoinSubmit}>
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
        <span className="message-data-time" >10:10 AM, Today{console.log("props",props.selectedList)}</span>
        <span className="message-data-name" >Olia</span> 
      </div>
      <div className="message other-message float-right">Hi Vincent</div>
    </li> 
    <li>
      <div className="message-data">
        <span className="message-data-name"> Vincent</span>
        <span className="message-data-time">10:12 AM, Today</span>
      </div>
      <div className="message my-message">Are we meeting today?</div>
    </li>
    {item}
  </ul>

</div>
  <div className="chat-message clearfix">
    <textarea name="message-to-send" id="message-to-send" placeholder ="Type your message" rows="2" onChange={handleMessageChange}></textarea>      
    <button onClick={handleSendMessage} >Send</button>
  </div>
</div>
  );
}
