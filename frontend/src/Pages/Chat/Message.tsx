import React, { FC } from 'react';
import {Socket } from "socket.io-client";
import { useState, useEffect, useCallback } from 'react';
import { createContext, useContext } from "react";
import "./chat.css"
import "./chat.scss"
import { DatabaseContext } from './ChatLogin';

interface MessageProps {
  socket: Socket;
  selectedList : string;
  onQuit: () => void;
  UserId:Number;
  onUpdate:() =>void;
}

export default function Message(props:MessageProps) {
  const [messageList, setMessageList] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage]= useState("");
  const [ifShowMessage, setIfShowMessage] = useState(false);
  const [item, setItem] = useState([]);
  const database = useContext(DatabaseContext);
  const [userId, setUserId] = useState("");

  const handleQuit = () => {
    props.onQuit();
    setMessageList([]);
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
    setMessage("");
  };
  const handleMessageAuto= useCallback((payload)=>{
    setMessageList((prevme) => [...prevme, {
      roomName: "",
      userId : -1,
      timestamp: new Date().toISOString(),
      message : payload.message
    }]);
  },[]);

  const handleMessages = useCallback((payload) => {
    console.log("setMessageList", payload);
    // if(payload.userId != -1)
      setMessageList((prevme) => [...prevme, payload]);
  },[messageList]);

  useEffect(() => {
    // refersh context
    props.onUpdate();
  }, [messageList]);

  useEffect(() => {
    console.log("messageList", messageList);
    setItem(messageList.map((each) => {
      const date = new Date(each.timestamp);
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      const second = date.getSeconds().toString().padStart(2, '0');
      let className1 = "message-data";
      let className2 = "message";
      if (props.selectedList == null) {
        return null;
      }
      else {
        let username;
        if (each.userId === -1){
          username = "Notification";
        }
        else {
          let user = database.find((user) => user.id === each.userId);
          if (user === undefined) {
            console.log("here??")
            props.onUpdate();
            const interval = setInterval(() => {
            user = database.find((user) => user.id === each.userId);
            if (user !== undefined) {
                clearInterval(interval);
                // username = each.userId;
                console.log("user underfine");
                }
            }, 1000);
          } else {
            username = user.name
            // console.log("here", username);
          }
          if (each.userId === props.UserId) {
            className1 += " align-right";
            className2 += " other-message float-right";
          } else {
            className2 += " my-message"; 
          }
        }
        return (
          
          <li className="clearfix">
            <div className={className1}>
              <span className="message-data-name">  {username}</span>
              <span className="message-data-time">{hour}:{minute}:{second}</span>
            </div>
              <div className={className2}>{each.message}</div>
          </li>
        );
    }})
    );
  },[props.selectedList, messageList, database] )
  
  useEffect(() => {
    if (props.socket) {
      props.socket.on("roomMsgHistReceived", (payload) => {console.log(`roomMsgHistReceived, : ${JSON.stringify(payload)}`);
      setMessageList(payload.msgHist);});
      props.socket.on("roomJoined", ()=>{console.log ("roomJoined\n");});
      props.socket.on("roomMsgReceived", handleMessages);
      props.socket.on("userInvited", handleMessageAuto);
    }
    return () => {
      if (props.socket) {
        props.socket.off("roomMsgHistReceived");
        props.socket.off("roomJoined");
        props.socket.off("roomMsgReceived", handleMessages);
        props.socket.off("userInvited", handleMessageAuto);
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
  {/* <button className="col-2" onClick={handleJoinRoom} >Join</button> */}
  <button className="col-2" onClick={handleQuit}>Leave</button>
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
        <span className="message-data-time" >10:10 AM, Today</span>
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
    <textarea name="message-to-send" id="message-to-send" placeholder ="Type your message" rows="2" value={message} onChange={handleMessageChange}></textarea>      
    <button onClick={handleSendMessage} >Send</button>
  </div>
</div>
  );
}
