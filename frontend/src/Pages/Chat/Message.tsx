import React, { FC } from 'react';
import {Socket } from "socket.io-client";
import { useState, useEffect, useCallback } from 'react';
import { createContext, useContext } from "react";
import "./chat.css"
import "./chat.scss"
import { DatabaseContext } from './ChatLogin';

interface MessageProps {
  socket: Socket;
  roomName: string;
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
    const payload = {
      roomName: props.roomName,
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
    // if(payload.userId != -1)
      setMessageList((prevme) => [...prevme, payload]);
  },[messageList]);

  useEffect(() => {
    // refersh context
    props.onUpdate();
  }, [messageList]);

  useEffect(() => {
    console.log("messageList", messageList);
    setItem(messageList.sort((a, b) => a.timestamp - b.timestamp)
      .map((each) => {
      const date = new Date(each.timestamp);
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      const second = date.getSeconds().toString().padStart(2, '0');
      let className1 = "message-data";
      let className2 = "message";
      if (props.roomName == null) {
        console.log("props.roomName == nul")
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
  },[props.roomName, messageList, database] )
  
  useEffect(() => {
    if (props.socket) {
      props.socket.on("roomMsgHistReceived", (payload) => {console.log(`roomMsgHistReceived, : ${JSON.stringify(payload)}`);
      setMessageList(payload.msgHist);});
      // props.socket.on("roomJoined", ()=>{console.log ("roomJoined\n");});
      props.socket.on("roomMsgReceived", handleMessages);
      props.socket.on("userInvited", handleMessageAuto);
    }
    return () => {
      if (props.socket) {
        props.socket.off("roomMsgHistReceived");
        // props.socket.off("roomJoined");
        props.socket.off("roomMsgReceived", handleMessages);
        props.socket.off("userInvited", handleMessageAuto);
      }
    };
  }, [props.socket]);

  return (
    props.roomName ? (
<div className="chat">
<div className="chat-header clearfix">
  <div className="chat-about container">
    <div className="row">
      <div className="chat-with col-6">Chatroom : {props.roomName}, {props.UserId}</div>
    </div>
      <button className="col-2" onClick={handleQuit}>Leave</button>
    </div>
</div> 

<div className="chat-history">
  <ul>
    {item}
  </ul>

</div>
  <div className="chat-message clearfix">
    <textarea name="message-to-send" id="message-to-send" placeholder ="Type your message" rows="2" value={message} onChange={handleMessageChange}></textarea>      
    <button onClick={handleSendMessage} >Send</button>
  </div>
</div>):<div className="chat"> <h4>Choose a room to view messages</h4></div> 
  );
}
