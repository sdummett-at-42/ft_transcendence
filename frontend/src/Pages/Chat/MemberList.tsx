import React from 'react';
import { useRef, useEffect, useCallback } from "react";
import { useState } from 'react';
import { Socket } from "socket.io-client";
import { DatabaseContext } from './ChatLogin'
import { createContext, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faTableTennis, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import "./chat.scss"

interface MemberListProps {
  socket: Socket, 
  onListClick : (list: string) => void,
  roomName :string,
  UserId: Number,
}

export default function MemberList(props: MemberListProps) {
    const database = useContext(DatabaseContext);
    const [item, setItem] = useState([]);
    const [members, setMembers ] = useState({ owner: '', admins: [], members: [] });

    const hanldeDM= (id, name) => {
        props.onListClick(name);
    //   props.socket.emit("sendDM", )
    };

    useEffect(() => {
    //  console.log("members2222", members);
    setItem(members.members.map((each, index) => {
        let user = database.find((user) => user.id === each);
        let role = "member";
        if(members.owner.includes(each) ==  true)
            role = "Owner";
        else if (members.admins.includes(each) ==  true)
            role = "Admin";
        return (
          <>
            <li className="clearfix col-7 " key={index}>
            <img  src={user.profilePicture} alt="avatar" />
            <div className="about">
              <div className="name ">{user.name}</div>
              <div className="status">
                <i className="fa fa-circle online"></i> {role}
              </div>    
            </div>             
          </li>
          
            {/* play, message, block, unmute, unban */}
          {user.id === props.UserId ? null : (<div className="col-5"><button className="PendingFriend-button" onClick={()=>hanldeDM(user.id, user.name)}><FontAwesomeIcon icon={faMessage} size="lg" /></button>
          <button className="PendingFriend-button"><FontAwesomeIcon icon={faTableTennis} size="lg" /></button>
          <button className="PendingFriend-button" ><FontAwesomeIcon icon={faEllipsisVertical} size="lg" /></button>
          </div>)}
          </>
        );
    })
    );
    }, [database, members]);
    const handleMemberList = useCallback((payload)=>{
        setMembers(payload.memberList);
    },[members])
  const handleMemberUpdate =useCallback((payload)=>{
    console.log("handleMemberUpdate", payload)
    setMembers(payload.memberList);
  },[members])
    useEffect(() => {
        if (props.socket) {        
          props.socket.on("roomMembers", handleMemberList);
          props.socket.on("memberListUpdated",handleMemberUpdate);
          // props.socket.off("roomAdminAdded", handleAdminUpdate);
        }
        return () => {
          if (props.socket) {
            props.socket.off("roomMembers", handleMemberList);
            props.socket.off("memberListUpdated",handleMemberUpdate);
            // props.socket.off("roomAdminAdded", handleAdminUpdate);
          }
        };
    }, [props.socket, handleMemberList]);
    return  (
        <div className="chat-info-header clearfix">
        <div className='chat-info-member-list'>Member List </div>
        <div className="row">
            {item}
            </div>
        </div>
    );
  };