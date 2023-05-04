import React, { FC } from 'react';
import "./Message.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Socket } from "socket.io-client";
import { useState, useEffect, useCallback } from 'react';
import { useContext } from "react";
import { DatabaseContext } from '../ChatLogin';

interface MessageProps {
  socket: Socket,
  roomName: string,
  ifDM: boolean,
  toDMID: {
    id: number;
    name: string;
  };
  onQuit: () => void,
  UserId: Number,
  onUpdate: () => void,
}

export default function Message(props: MessageProps) {
  const [messageList, setMessageList] = useState([]);
  const [message, setMessage] = useState("");
  const [item, setItem] = useState([]);
  const database = useContext(DatabaseContext);
  const [dmList, setDmList] = useState([]);
  const [itemDM, setItemDM] = useState([]);

  const handleQuit = () => {
    props.onQuit();
    setMessageList([]);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = (event) => {
    if (message.length === 0 || message.trim().length === 0) {
      setMessage("");
      return;
    }
    if (props.ifDM == false) {
      const payload = {
        roomName: props.roomName,
        message: message,
      }
      props.socket.emit("sendRoomMsg", payload);
    } else {
      const payload = {
        userId: props.toDMID.id,
        message: message,
      }
      props.socket.emit("sendDM", payload);
    }
    setMessage("");
  };

  const handleMessages = useCallback((payload) => {
    if (payload.roomName === props.roomName){
      setMessageList((prevme) => [...prevme, payload]);
    }
  }, [messageList]);

  const handleDMupdate1 = useCallback((payload) => {
    // console.log("dmupdate1", payload);
    if(props.UserId === payload.userId){
      setDmList((prevme) => [...prevme, payload]);
    }
  }, [dmList]);
  const handleDMupdate2 = useCallback((payload) => {
    // console.log("dmupdate2", payload);
    const userName = database.find((user) => user.id === payload.userId);
    if(userName && userName.name === props.roomName){
      setDmList((prevme) => [...prevme, payload]);
    }
  }, [dmList]);

  const handleEnter = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage(event);
    }
  };

  useEffect(() => {
    props.onUpdate();
  }, [messageList, dmList]);

  useEffect(() => {
    const sortitemDM = dmList.sort((a, b) => (new Date(a.timestamp)) - (new Date(b.timestamp)));
    setItemDM(dmList.sort((a, b) => a.timestamp - b.timestamp)
      .map((each, index) => {
        const date = new Date(each.timestamp);
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        const second = date.getSeconds().toString().padStart(2, '0');
        let className1 = "Message-data";
        let className2 = "Message";
        if (props.roomName == null) {
          return null;
        }
        else {
          let username;
          if (each.userId === -1) {
            username = "Notification";
          }
          else {
            let user = database.find((user) => user.id === each.userId);
            if (user === undefined) {
              props.onUpdate();
              const interval = setInterval(() => {
                user = database.find((user) => user.id === each.userId);
                if (user !== undefined) {
                  clearInterval(interval);
                }
                else{
                  clearInterval(interval);
                }
              }, 1000);
            } else {
              username = user.name
            }
            if (each.userId === props.UserId) {
              className1 += " align-right";
              className2 += " other-message float-right";
            } else {
              className1 += " align-left";
              className2 += " my-message";
            }
          }
          return (

            <li className="clearfix" key={index}>
              <div className={className1}>
                <span className="Message-data-name">  {username}</span>
                <span className="Message-data-time">{hour}:{minute}:{second}</span>
              </div>
              <div className={className2}>{each.message}</div>
            </li>
          );
        }
      })
    );
  }, [dmList, database])
  useEffect(() => {


    setItem(messageList.sort((a, b) => a.timestamp - b.timestamp)
      .map((each, index) => {
        const date = new Date(each.timestamp);
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        const second = date.getSeconds().toString().padStart(2, '0');
        let className1 = "Message-data";
        let className2 = "Message";
        if (props.roomName == null) {
          return null;
        }
        else {
          let username;
          let message;
          if (each.userId === -1) {
            username = "Notification";
            let user = database.find((user) => user.id === each.targetId);
            if (user === undefined)
              message = each.targetId + each.message;
            else
              message = user.name + each.message;
          }
          else {
            let user = database.find((user) => user.id === each.userId);
            if (user === undefined) {
              props.onUpdate();
              const interval = setInterval(() => {
                user = database.find((user) => user.id === each.userId);
                if (user !== undefined) {
                  clearInterval(interval);
                } else{
                  clearInterval(interval);
                }
              }, 1000);
            } else {
              username = user.name
            }
            if (each.userId === props.UserId) {
              className1 += " align-right";
              className2 += " other-message float-right";
            } else {
              className1 += " align-left";
              className2 += " my-message";
            }
          }
          return (

            <li className="clearfix" key={index}>
              <div className={className1}>
                <span className="Message-data-name">{username}</span>
                <span className="Message-data-time">{hour}:{minute}:{second}</span>
              </div>
              <div className={className2}>{each.userId === -1? message : each.message}</div>
            </li>
          );
        }
      })
    );
  }, [messageList, database])

  const handleDMReceived = useCallback((payload) => {
    setDmList(payload.msgHist);
  }, [dmList])

  const handleMessagesReceived = useCallback((payload) => {
    setMessageList(payload.msgHist);
  }, [messageList])
  const handleAlertmessage = useCallback((payload) => {
    alert(payload.message);
}, [])
  const handleRemoveRoom = useCallback((payload)=>{
    if(payload.roomName ===  props.roomName)
      setMessageList("");
},[])
  useEffect(() => {
    if(props.socket){
      props.socket.on("roomMsgHistReceived", handleMessagesReceived);
      props.socket.on("roomMsgReceived", handleMessages);
      props.socket.on("dmHist", handleDMReceived);
      props.socket.on("DMReceived1", handleDMupdate1);
      props.socket.on("DMReceived2", handleDMupdate2);
      props.socket.on("DMNotSended", handleAlertmessage);
      props.socket.on("userInvited", handleAlertmessage);
      props.socket.on("roomMsgNotSended", handleAlertmessage);
      props.socket.on("banned", handleRemoveRoom);
      props.socket.on("kicked", handleRemoveRoom);
    }
    return () => {
      if(props.socket){
        props.socket.off("roomMsgHistReceived", handleMessagesReceived);
        props.socket.off("roomMsgReceived", handleMessages);
        props.socket.off("dmHist", handleDMReceived);
        props.socket.off("DMReceived1", handleDMupdate1);
        props.socket.off("DMReceived2", handleDMupdate2);
        props.socket.off("userInvited",handleAlertmessage);
        props.socket.off("DMNotSended", handleAlertmessage);
        props.socket.off("roomMsgNotSended", handleAlertmessage);
        props.socket.off("banned", handleRemoveRoom);
        props.socket.off("kicked", handleRemoveRoom);
      }
    };
  }, [props.socket, props.roomName, handleMessagesReceived, handleMessages, handleDMReceived, handleDMupdate1,handleDMupdate2, handleAlertmessage]);

  return (
    <div className="Message-screen">
        <div className="ChatRoom-screen-card">
        <div className="ChatRoom-screen-card-overlay"></div>
            <div className="Message-screen-card-content">
                <div className="ChatRoom-screen-card-content-body">
                {!props.roomName ? (
                    <div className="Profile-screen-card-text">
                        <h4>Choisissez un salon pour afficher les messages</h4>
                    </div>
                ) : (
                  <div>
                      <div className="Message-screen-card-user">
                          <div className="Profile-screen-card-title">{props.roomName}</div>
                          {props.ifDM ? null : <button className="Settings-button Settings-delete-account-button" onClick={handleQuit}>Quitter</button>}
                      </div>
                      <div className="Message-chat-history">
                          <ul className='Message-ul'>
                              {props.ifDM ? itemDM : item}
                          </ul>
                      </div>
                      <div className="chat-message">
                          <textarea name="message-to-send" className='Message-textarea' autoFocus={true} placeholder="Aa" value={message} onChange={handleMessageChange} onKeyDown={handleEnter}></textarea>
                          <FontAwesomeIcon icon={faPaperPlane} size='2xl' className='Message-send-icon' onClick={handleSendMessage} />
                      </div>
                  </div>
                )}
            </div>
        </div>
    </div>
    </div>
  );
}