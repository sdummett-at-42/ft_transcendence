import React, { FC } from 'react';
import { Socket } from "socket.io-client";
import { useState, useEffect, useCallback } from 'react';
import { useContext } from "react";
import "./chat.scss"
import { DatabaseContext } from './ChatLogin';

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
    if (props.ifDM == false) {
      console.log("props.ifDM == false")
      const payload = {
        roomName: props.roomName,
        message: message,
      }
      props.socket.emit("sendRoomMsg", payload);
    } else {
      console.log("props.ifDM == true")
      const payload = {
        userId: props.toDMID.id,
        message: message,
      }
      props.socket.emit("sendDM", payload);
    }
    setMessage("");
  };

  const handleMessages = useCallback((payload) => {
    setMessageList((prevme) => [...prevme, payload]);
  }, [messageList]);

  const handleDMupdate = useCallback((payload) => {
    console.log("handleDMupdate", payload);
    setDmList((prevme) => [...prevme, payload]);
  }, [dmList]);

  useEffect(() => {
    // refersh context
    props.onUpdate();
  }, [messageList, dmList]);

  useEffect(() => {
    console.log("dmList", dmList);
    const sortitemDM = dmList.sort((a, b) => (new Date(a.timestamp)) - (new Date(b.timestamp)));
    // console.log("sortitemDM", sortitemDM);
    setItemDM(dmList.sort((a, b) => a.timestamp - b.timestamp)
      .map((each, index) => {
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
                  console.log("user underfine");
                }
              }, 1000);
            } else {
              username = user.name
            }
            if (each.userId === props.UserId) {
              className1 += " align-right";
              className2 += " other-message float-right";
            } else {
              className2 += " my-message";
            }
          }
          return (

            <li className="clearfix" key={index}>
              <div className={className1}>
                <span className="message-data-name">  {username}</span>
                <span className="message-data-time">{hour}:{minute}:{second}</span>
              </div>
              <div className={className2}>{each.message}</div>
            </li>
          );
        }
      })
    );
  }, [dmList, database])
  useEffect(() => {
    // console.log("messageList", messageList);
    setItem(messageList.sort((a, b) => a.timestamp - b.timestamp)
      .map((each, index) => {
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
                  // username = each.userId;
                  console.log("user underfine");
                }
              }, 1000);
            } else {
              username = user.name
            }
            if (each.userId === props.UserId) {
              className1 += " align-right";
              className2 += " other-message float-right";
            } else {
              className2 += " my-message";
            }
          }
          return (

            <li className="clearfix" key={index}>
              <div className={className1}>
                <span className="message-data-name">  {username}</span>
                <span className="message-data-time">{hour}:{minute}:{second}</span>
              </div>
              <div className={className2}>{each.userId === -1? message : each.message}</div>
            </li>
          );
        }
      })
    );
  }, [messageList, database])

  const handleDMReceived = useCallback((payload) => {
    // console.log(`dm : ${JSON.stringify(payload)}`);
    setDmList(payload.msgHist);
  }, [dmList])

  const handleMessagesReceived = useCallback((payload) => {
    // console.log(`roomMsgHistReceived, : ${JSON.stringify(payload)}`);
    setMessageList(payload.msgHist);
  }, [messageList])
  const handleAlertmessage = useCallback((payload) => {
    alert(payload.message);
}, [])
  useEffect(() => {
    if(props.socket){
      props.socket.on("roomMsgHistReceived", handleMessagesReceived);
      props.socket.on("roomMsgReceived", handleMessages);
      props.socket.on("dmHist", handleDMReceived);
      props.socket.on("DMReceived", handleDMupdate);
      props.socket.on("DMNotSended", handleAlertmessage);
      props.socket.on("userInvited", handleAlertmessage);
      props.socket.on("roomMsgNotSended", handleAlertmessage);
    }
    return () => {
      if(props.socket){
        props.socket.off("roomMsgHistReceived", handleMessagesReceived);
        props.socket.off("roomMsgReceived", handleMessages);
        props.socket.off("dmHist", handleDMReceived);
        props.socket.off("DMReceived", handleDMupdate);
        props.socket.off("userInvited",handleAlertmessage);
        props.socket.off("DMNotSended", handleAlertmessage);
        props.socket.off("roomMsgNotSended", handleAlertmessage);
      }
    };
  }, [props.socket, handleMessagesReceived, handleMessages, handleDMReceived, handleDMupdate, handleAlertmessage]);

  return (
    props.roomName ? (
      <div className="chat col-lg-6 ">
        <div className="chat-header clearfix">
          <div className="chat-about">
            <div className="row">
              <div className="chat-with col-6">Salon : {props.roomName}</div>
            </div>
            {props.ifDM ? null : <button className="col-2" onClick={handleQuit}>Quitter</button>}
          </div>
        </div>

        <div className="chat-history">
          <ul>
            {props.ifDM ? itemDM : item}
          </ul>

        </div>
        <div className="chat-message clearfix">
          <textarea name="message-to-send" id="message-to-send" placeholder="Tapez votre message" rows="2" value={message} onChange={handleMessageChange}></textarea>
          <button onClick={handleSendMessage} >Envoyer</button>
        </div>
      </div>) : <div className="chat col-lg-6"> <h4>Choisissez un salon pour afficher les messages</h4></div>
  );
}
