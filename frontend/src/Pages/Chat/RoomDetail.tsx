import React, { FC } from 'react';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBan, faPlus, faVolumeXmark, faPersonRunning} from '@fortawesome/free-solid-svg-icons';
import { faMessageSlash} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Setting from './Setting';
import { useState, useEffect , useCallback} from 'react';
import { io, Socket } from "socket.io-client";
import { createContext, useContext } from "react";
import { DatabaseContext } from './ChatLogin';
import InvitedConfirm from './InvitedConfirm';
import MemberList from './MemberList';

interface RoomDetailProps {
  socket: Socket;
  roomName : string;
  onUpdate:() =>void;
  UserId: Number;
  
}

export default function RoomDetail(props: RoomDetailProps) {
  const [show, setShow] = useState(false);
  const [inputInvite, setInputInvite] = useState("");
  const [inputBan, setInputBan] = useState("");
  const [inputMute, setInputMute] = useState("");
  const [inputKick, setInputKick] = useState("");
  const database = useContext(DatabaseContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [roomNameInvite, setRoomNameInvite] = useState("");
  const [userId, setUserId] = useState(0);
  const [ifAdmin, setIfAdmin] = useState(false);
  const [adminList, setAdminList] = useState([]);
  const close = () => {
    setShow(false);
  };

  const findInDatabase = (name) => {
      let user = database.find((user) => user.name === name);
      if (user === undefined) {
        props.onUpdate();
        const interval = setInterval(() => {
          user = database.find((user) => user.name === name);
          if (user !== undefined) {
            clearInterval(interval);
            setUserId(user.id);
            alert("Can not find the user, please try again.");
          }
        }, 1000);
      } else {
        setUserId(user.id);
      }
    return userId;
  };

  const handleInvite =()=>{
    let userId = findInDatabase(inputInvite);
    if (userId == 0){
      alert("User not found. Please try again.");
      return ;
    }
    const payload ={
      roomName: props.roomName,
      userId: userId,
    }
    props.socket.emit("inviteUser", payload);
}

const handleBan = () => {
  let userId = findInDatabase(inputBan);
  if (userId == 0){
    alert("User not found. Please try again.");
    return ;
  }
  const payload ={
    roomName: props.roomName,
    userId: userId,
  }
  props.socket.emit("banUser", payload);
}
const handleMute = () => {
  let userId = findInDatabase(inputMute);
  if (userId == 0){
    alert("User not found. Please try again.");
    return ;
  }
  const payload ={
    roomName: props.roomName,
    userId: userId,
    timeout: 60,
  }
  props.socket.emit("muteUser", payload);
}

const handleKick = () => {
  let userId = findInDatabase(inputKick);
  if (userId == 0){
    alert("User not found. Please try again.");
    return ;
  }
  const payload ={
    roomName: props.roomName,
    userId: userId,
  }
  props.socket.emit("kcikUser", payload);
}
  const  handleInvited = useCallback((payload) =>{
      setMessage(payload.message);
      setRoomNameInvite(payload.roomName);
      setShowConfirm(true);    
  }, [])

const handleNotInvite = useCallback((payload) =>{
    console.log("not inviting,",payload);
    alert(payload.message);  
}, [])

const handleAdminList = useCallback((payload)=>{
  setAdminList(payload.memberList.admins);
},[props.UserId, adminList])
const handleCheckIfAdmin = useCallback((payload)=>{
  console.log(" handleCheckIfAdmin", payload)
  if(payload.roomName !== props.roomName){
    console.log("update not this room!");
    return;
  }
  setAdminList(payload.memberList.admins);
  // if (adminList.includes(props.UserId))  
  //   setIfAdmin(true);
  // else
  //   setIfAdmin(false);
},[props.UserId, props.roomName, ifAdmin, adminList])
useEffect(() => {
  if (adminList.includes(props.UserId))
    setIfAdmin(true);
  else
    setIfAdmin(false);
}, [adminList]);
  useEffect(() => {
      if (props.socket) {
        props.socket.on("invited", handleInvited);
        props.socket.on("userNotInvited", handleNotInvite);
        props.socket.on("memberListUpdated", handleCheckIfAdmin);
        props.socket.on("roomMembers", handleAdminList);
      }
      return () => {
        if (props.socket) {
          props.socket.off("invited", handleInvited);
          props.socket.off("userNotInvited", handleNotInvite);
          props.socket.off("memberListUpdated", handleCheckIfAdmin);
          props.socket.off("roomMembers", handleAdminList);
        }
      };
  }, [props.socket,  props.onUpdate, handleInvited, handleNotInvite, handleCheckIfAdmin]);

 return (
  props.roomName ? (
  <div className="chatinfo">
      <div className="chat-info-header clearfix">
      <div className='chat-info-title'>Room Info
    
        {ifAdmin? (
        <button  onClick={() => {
          setShow(true);}} >Setting</button>
         ) : null}
          <Setting         isVisible={show}
            socket={props.socket}
            onClose={() => setShow(false)} 
            roomName = {props.roomName} 
            onUpdate = {props.onUpdate}/>
          <InvitedConfirm isVisible={showConfirm}
            RoomName={roomNameInvite}
            onClose={() => setShowConfirm(false)} 
            socket={props.socket}
            message = {message}/></div>
            {/* <div className='chat-info-subtitle'>Public</div> */}
            <div className='chat-info-subtitle'>Invite a friend</div>
            <div className="chat-info-form">
            <input placeholder="Name" value={inputInvite} onChange={(e) => setInputInvite(e.target.value)}/>
            <button onClick={handleInvite}><FontAwesomeIcon icon={faPlus} /></button>
            </div>
            {ifAdmin? (
            <><div className='chat-info-subtitle'>Ban a Member</div>
           <div className="chat-info-form">
           <input placeholder="Name" value={inputBan} onChange={(e) => setInputBan(e.target.value)} ></input>
           <button onClick={handleBan}><FontAwesomeIcon icon={faBan} /></button>
           </div>
           <div className='chat-info-subtitle'>Mute a Member</div>
           <div className="chat-info-form">
            <input placeholder="Name" value={inputMute} onChange={(e) => setInputMute(e.target.value)} ></input>
           <button onClick={handleMute}><FontAwesomeIcon icon={faVolumeXmark}/></button>
           </div>
           <div className='chat-info-subtitle'>Kick a Member</div>
           <div className="chat-info-form">
            <input placeholder="Name" value={inputKick} onChange={(e) => setInputKick(e.target.value)}></input>
           <button onClick={handleKick}><FontAwesomeIcon icon={faPersonRunning}/></button>
           </div></>
            ) : null}
      </div>
      <MemberList socket={props.socket} roomName={props.roomName} />
  </div>) : <div className="chatinfo" ></div>
 );
}

