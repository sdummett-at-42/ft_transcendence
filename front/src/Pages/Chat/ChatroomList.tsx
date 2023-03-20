import React, { FC } from 'react';
import {roomList} from './data'


interface ChatroomListProps {}

const ChatroomList: FC<ChatroomListProps> = () => (
  <div >
    {roomList.map(index=>
    <div>{index.chatname}</div>)}
  </div>
);

export default ChatroomList;
