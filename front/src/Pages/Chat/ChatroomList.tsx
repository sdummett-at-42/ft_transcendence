import React, { FC } from 'react';
import {roomList} from './data'
import { useState, useEffect } from 'react';
import Modal from "./Modal";


export default function ChatroomList(props) {
  const [chatrooms, setChatrooms] = useState([]);
  const [show, setShow] = useState(false);
    const close = () => {
      setShow(false);
    };
  // useEffect(() => {
  //   // Fetch list of chatrooms
  //   fetch('/api/chatrooms')
  //     .then(response => response.json())
  //     .then(data => setChatrooms(data));
  // }, []);

  function handleChatroomClick(chatroomId) {
    props.onChatroomSelect(chatroomId);
  }

  return (
    // <div>
    //   {roomList.map(chatroom => (
    //     <div key={chatroom.id} onClick={() => handleChatroomClick(chatroom.id)}>
    //       <a href="#" className="list-group-item list-group-item-action">
    //         <div className="d-flex w-100 justify-content-between">
    //         <h5 className="mb-1">{chatroom.chatname}</h5>
    //         <small className="text-muted">3 days ago</small>
    //         </div>
    //         <small className="text-muted">Last message.</small>
    //       </a>
    //       <h2></h2>
    //       <p></p>
    //     </div>
    //   ))}
    // </div>

    <div className="people-list" id="people-list">
            <div className="search">
            <button  onClick={() => {
          setShow(true);}} >Create a New ChatRoom</button>
          <Modal         isVisible={show}
            title="Modal Title"
            content={<p>Add your content here</p>}
            footer={<button>Cancel</button>}
            onClose={() => setShow(false)} />
           
            <i className="fa fa-plus" aria-hidden="true"></i>
            {/* <input type="text" placeholder="search" /> */}
            
            </div>
          <ul className="list">
            <li className="clearfix">       
              <div className="about">
                <div className="name">Group a</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> online
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <div className="about">
                <div className="name">Gaming</div>
                <div className="status">
                  <i className="fa fa-circle offline"></i> left 7 mins ago
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <div className="about">
                <div className="name">Mike Thomas</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> online
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <div className="about">
                <div className="name">Transcendance </div>
                <div className="status">
                  <i className="fa fa-circle online"></i> online
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <div className="about">
                <div className="name">Webserv</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> online
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <div className="about">
                <div className="name">Hello</div>
                <div className="status">
                  <i className="fa fa-circle offline"></i> left 30 mins ago
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <div className="about">
                <div className="name">Christian Kelly</div>
                <div className="status">
                  <i className="fa fa-circle offline"></i> left 10 hours ago
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <div className="about">
                <div className="name">Monica Ward</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> online
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <div className="about">
                <div className="name">Dean Henry</div>
                <div className="status">
                  <i className="fa fa-circle offline"></i> offline since Oct 28
                </div>
              </div>
            </li>
            
            <li className="clearfix">
              <div className="about">
                <div className="name">Peyton Mckinney</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> online
                </div>
              </div>
            </li>
          </ul>
        </div>
    
  );
}

