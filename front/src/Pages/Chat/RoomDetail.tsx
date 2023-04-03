import React, { FC } from 'react';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBan, faPlus, faVolumeXmark, faPersonRunning} from '@fortawesome/free-solid-svg-icons';
import { faMessageSlash} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Setting from './Setting';
import { useState, useEffect } from 'react';
import { io, Socket } from "socket.io-client";

interface RoomDetailProps {
  socket: Socket;
}

const RoomDetail: FC<RoomDetailProps> = () => {
  const [show, setShow] = useState(false);
  const close = () => {
    setShow(false);
  };
  // const handleSettingChange = (event) => {

  //   const { name, value } = event.target;
  //   setFormData({
  //     ...formData,
  //     [name]: value
  //   });
  // };
 return (
  <div className="chatinfo">
      <div className="chat-info-header clearfix">
      <div className='chat-info-title'>Room Info</div>
        <div className='chat-info-subtitle'>Accessibility</div>
        <button  onClick={() => {
          setShow(true);}} >Change</button>
          <Setting         isVisible={show}
            title="Modal Title"
            content={<p>Add your content here</p>}
            footer={<button>Cancel</button>}
            onClose={() => setShow(false)} />
            <div className='chat-info-subtitle'>Public</div>
            <div className='chat-info-subtitle'>Invite a friend</div>
            <input placeholder="Name"></input>
            <i className="fa fa-plus" aria-hidden="true"></i>
           <FontAwesomeIcon icon={faPlus} size="1.5x"/>
           <div className='chat-info-subtitle'>Ban a Member</div>
           <input placeholder="Name"></input>
           <FontAwesomeIcon icon={faBan} size="1.5x"/>
           <div className='chat-info-subtitle'>Mute a Member</div>
           <input placeholder="Name"></input>
           <FontAwesomeIcon icon={faVolumeXmark} />
           <div className='chat-info-subtitle'>Kick a Member</div>
           <input placeholder="Name"></input>
           <FontAwesomeIcon icon={faPersonRunning} />
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

export default RoomDetail;
