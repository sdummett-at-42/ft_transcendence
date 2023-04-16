import React from 'react';
import { useRef, useEffect, useCallback } from "react";
import { useState } from 'react';
import { Socket } from "socket.io-client";
import { DatabaseContext } from './RoomDetail'
import { createContext, useContext } from "react";
import "./chat.scss"

interface MemberListProps {
  socket: Socket, 
  roomName :string,
}

export default function MemberList(props: MemberListProps) {
    const database = useContext(DatabaseContext);
    const [item, setItem] = useState([]);
    const [members, setMembers ] = useState({});

    useEffect(() => {
        
    // setItem(messageList.sort((a, b) => a.timestamp - b.timestamp)
    //   .map((each) => {
    //   const date = new Date(each.timestamp);
    //   const hour = date.getHours().toString().padStart(2, '0');
    //   const minute = date.getMinutes().toString().padStart(2, '0');
    //   const second = date.getSeconds().toString().padStart(2, '0');
    //   let className1 = "message-data";
    //   let className2 = "message";
    //   if (props.roomName == null) {
    //     console.log("props.roomName == nul")
    //     return null;
    //   }
    //   else {
    //     let username;
    //     if (each.userId === -1){
    //       username = "Notification";
    //     }
    //     else {
    //       let user = database.find((user) => user.id === each.userId);
    //       if (user === undefined) {
    //         console.log("here??")
    //         props.onUpdate();
    //         const interval = setInterval(() => {
    //         user = database.find((user) => user.id === each.userId);
    //         if (user !== undefined) {
    //             clearInterval(interval);
    //             // username = each.userId;
    //             console.log("user underfine");
    //             }
    //         }, 1000);
    //       } else {
    //         username = user.name
    //         // console.log("here", username);
    //       }
    //       if (each.userId === props.UserId) {
    //         className1 += " align-right";
    //         className2 += " other-message float-right";
    //       } else {
    //         className2 += " my-message"; 
    //       }
    //     }
    //     return (
          
    //       <li className="clearfix">
    //         <div className={className1}>
    //           <span className="message-data-name">  {username}</span>
    //           <span className="message-data-time">{hour}:{minute}:{second}</span>
    //         </div>
    //           <div className={className2}>{each.message}</div>
    //       </li>
    //     );
    // }})
    // );
    }, [database, members]);
    const handleMemberList = useCallback((payload)=>{
        setMembers(payload.memberList);
      },[])
    useEffect(() => {
        if (props.socket) {        
          props.socket.on("roomMembers", handleMemberList);
        }
        return () => {
          if (props.socket) {
            props.socket.off("roomMembers", handleMemberList);
          }
        };
    }, [props.socket, handleMemberList]);
    return  (
        <div className="chat-info-header clearfix">
        <div className='chat-info-memberlist'>Member List</div>
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_08.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Monica Ward</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> Admin
                </div>    
              </div>             
            </li>
            <button>Play</button><button>Message</button><button>...</button>
            {/* <button>Play</button><button>Message</button><button>Block</button> */}
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_03.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Mike Thomas</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> Member
                </div>
              </div>
            </li>
            <button>Play</button><button>Message</button><button>...</button>
            {/* <button>Play</button><button>Message</button><button>Block</button> */}
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_05.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Ginger Johnston</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> online
                </div>
              </div>
            </li>
            <button>Play</button><button>Message</button><button>...</button>
            {/* <button>Play</button><button>Message</button><button>Block</button> */}
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_06.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Tracy Carpenter</div>
                <div className="status">
                  <i className="fa fa-circle offline"></i> left 30 mins ago
                </div>
              </div>
            </li>
            <button>Play</button><button>Message</button><button>Block</button>
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_07.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Christian Kelly</div>
                <div className="status">
                  <i className="fa fa-circle offline"></i> left 10 hours ago
                </div>
              </div>
            </li>
            <button>Play</button><button>Message</button><button>...</button>
            {/* <button>Play</button><button>Message</button><button>Block</button> */}
            
      </div>
    );
  };