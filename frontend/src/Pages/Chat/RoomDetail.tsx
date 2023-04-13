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

interface RoomDetailProps {
  socket: Socket;
  selectedList : string;
  onUpdate:() =>void;
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
      roomName: props.selectedList,
      userId: userId,
    }
    props.socket.emit("inviteUser", payload);
  }

  const  handleInvited = useCallback((payload) =>{
      console.log("INVITEING,",payload);
      setMessage(payload.message);
      setRoomNameInvite(payload.roomName);
      console.log("RoomName", );
      setShowConfirm(true);    
  }, [])

  const handleNotInvite = useCallback((payload) =>{
    console.log("not inviting,",payload);
    alert(payload.message);  
}, [])

  useEffect(() => {
      if (props.socket) {
        props.socket.on("invited", handleInvited);
        props.socket.on("userNotInvited", handleNotInvite);
      }
      return () => {
        if (props.socket) {
          props.socket.off("invited", handleInvited);
          props.socket.off("userNotInvited", handleNotInvite);
        }
      };
  }, [props.socket]);


 return (
  props.selectedList ? (
  <div className="chatinfo">
      <div className="chat-info-header clearfix">
      <div className='chat-info-title'>Room Info :{props.selectedList}</div>
        <div className='chat-info-subtitle'>Accessibility</div>
        <button  onClick={() => {
          setShow(true);}} >Change</button>
          <Setting         isVisible={show}
            socket={props.socket}
            onClose={() => setShow(false)} 
            selectedList = {props.selectedList }/>
          <InvitedConfirm isVisible={showConfirm}
            RoomName={roomNameInvite}
            onClose={() => setShowConfirm(false)} 
            socket={props.socket}
            message = {message}/>
            <div className='chat-info-subtitle'>Public</div>
            <div className='chat-info-subtitle'>Invite a friend</div>
            <div className="chat-info-form">
            <input placeholder="Name" value={inputInvite} onChange={(e) => setInputInvite(e.target.value)}/>
            <button onClick={handleInvite}><FontAwesomeIcon icon={faPlus} /></button>
            </div>
           <div className='chat-info-subtitle'>Ban a Member</div>
           <div className="chat-info-form">
           <input placeholder="Name" ></input>
           <button><FontAwesomeIcon icon={faBan} /></button>
           </div>
           <div className='chat-info-subtitle'>Mute a Member</div>
           <div className="chat-info-form">
            <input placeholder="Name"></input>
           <button><FontAwesomeIcon icon={faVolumeXmark}/></button>
           </div>
           <div className='chat-info-subtitle'>Kick a Member</div>
           <div className="chat-info-form">
            <input placeholder="Name"></input>
           <button><FontAwesomeIcon icon={faPersonRunning}/></button>
           </div>
           {/* <FontAwesomeIcon icon={faKickstarterK} size="1.5x"/> */}
      </div>
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
  </div>) : <div className="chatinfo" ></div>
 );
}

