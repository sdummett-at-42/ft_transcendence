import React, { FC } from 'react';


interface RoomDetailProps {}

const RoomDetail: FC<RoomDetailProps> = () => (
 
  <div className="chatinfo">
      <div className="chat-info-header clearfix">
        <div className='chat-info-title'>Room Setiting</div>

            <button >private</button>
            <button >public</button>
            <button >change</button>
      </div>
      <div className="chat-info-header clearfix">
        <div className='chat-info-title'>Member List</div>
            <li className="clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_08.jpg" alt="avatar" />
              <div className="about">
                <div className="name">Monica Ward</div>
                <div className="status">
                  <i className="fa fa-circle online"></i> online
                </div>
              </div>
            </li>

            
      </div>
  </div>

);

export default RoomDetail;
