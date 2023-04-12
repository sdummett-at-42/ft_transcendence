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
  const close = () => {
    setShow(false);
  };

  const findInDatabase = (name)=>{
    let user = database.find((user) => user.name === name);

    if (user === undefined) {
      props.onUpdate();
      setTimeout(() => {
        user = database.find((user) => user.name === name);
        if (user === undefined) {
          console.log("user is still undefined");
        } else {
          console.log("user found: ", user);
        }
      }, 1000);
    } else {
      console.log("user found: ", user);
    }
    return user.id;
  }

  const handleInvite =()=>{
    let userId = findInDatabase(inputInvite);
    const payload ={
      roomName: props.selectedList,
      userId: userId,
    }
    props.socket.emit("inviteUser", payload);
  }

  const  handleInvited = useCallback((payload) =>{
      console.log("INVITEING,",payload);
      const confirmed = window.confirm(payload.message + "Would you like to join it?");
      if (confirmed) {
        console.log("Join by inviting");
        const payloadNew = {
          roomName : payload.roomName,
          password : ""

        }
        props.socket.emit("joinRoom", payloadNew);
      }
    
  }, [])

  useEffect(() => {
      if (props.socket) {
        props.socket.on("invited", handleInvited);
      }
      return () => {
        if (props.socket) {
          props.socket.off("invited", handleInvited);
        }
      };
  }, [props.socket]);


 return (
  <div className="chatinfo">
      <div className="chat-info-header clearfix">
      <div className='chat-info-title'>Room Info</div>
        <div className='chat-info-subtitle'>Accessibility</div>
        <button  onClick={() => {
          setShow(true);}} >Change</button>
          <Setting         isVisible={show}
            socket={props.socket}
            footer={<button>Cancel</button>}
            onClose={() => setShow(false)} 
            selectedList = {props.selectedList }/>
            <div className='chat-info-subtitle'>Public</div>
            <div className='chat-info-subtitle'>Invite a friend</div>
            <input placeholder="Name" value={inputInvite} onChange={(e) => setInputInvite(e.target.value)}/>
            <FontAwesomeIcon icon={faPlus} onClick={handleInvite}/>
           <div className='chat-info-subtitle'>Ban a Member</div>
           <input placeholder="Name" ></input>
           <FontAwesomeIcon icon={faBan} />
           <div className='chat-info-subtitle'>Mute a Member</div>
           <input placeholder="Name"></input>
           <FontAwesomeIcon icon={faVolumeXmark}/>
           <div className='chat-info-subtitle'>Kick a Member</div>
           <input placeholder="Name"></input>
           <FontAwesomeIcon icon={faPersonRunning}/>
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
  </div>
 );
}

