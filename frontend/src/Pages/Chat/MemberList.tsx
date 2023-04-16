import React from 'react';
import { useRef, useEffect, useCallback } from "react";
import { useState } from 'react';
import { Socket } from "socket.io-client";
import { DatabaseContext } from './ChatLogin'
import { createContext, useContext } from "react";
import "./chat.scss"

interface MemberListProps {
  socket: Socket, 
  roomName :string,
}

export default function MemberList(props: MemberListProps) {
    const database = useContext(DatabaseContext);
    const [item, setItem] = useState([]);
    const [members, setMembers ] = useState({ owner: '', admins: [], members: [] });

    useEffect(() => {
     console.log("members2222", members);
    setItem(members.members.map((each) => {
        let user = database.find((user) => user.id === each);
        let role = "member";
        if(members.owner.includes(each) ==  true)
            role = "Owner";
        else if (members.admins.includes(each) ==  true)
            role = "Admin";
        return (
          <>
          <div className="row">
            <li className="clearfix col-6">
            <img  src={user.profilePicture} alt="avatar" />
            <div className="about">
              <div className="name">{user.name}</div>
              <div className="status">
                <i className="fa fa-circle online"></i> {role}
              </div>    
            </div>             
          </li>
          <div className="col-6">
          <button>Play</button><button>Message</button><button>...</button>
          </div>
          </div>
          </>
        );
    })
    );
    }, [database, members]);
    const handleMemberList = useCallback((payload)=>{
        console.log("handleMemberList", payload)
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
            {item}
        </div>
    );
  };