import React, { FC } from 'react';
import { useState, useEffect, useCallback} from 'react';
import Modal from "./Modal";
import { io, Socket } from "socket.io-client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock} from '@fortawesome/free-solid-svg-icons';
import RoomJoin from './RoomJoin';

interface ChatroomListProps {
  socket: Socket;
  onListClick : (list: string) => void;
}
export default function ChatroomList(props: ChatroomListProps) {
    // States
    const [chatrooms, setChatrooms] = useState([]);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [showJoinRoom, setShowJoinRoom] = useState(false);

    // Event handlers
    const handleRoomCreated = useCallback((payload) => {
      console.log("created");
    }, []);

    const handleRoomJoined = useCallback((payload) => {
      console.log("HERE joined", payload);
      setChatrooms((prevChatrooms) => [...prevChatrooms, {roomName: payload.roomName}]);

    }, []);

    // const handleRoomsList = useCallback((payload) => {
    //   // console.log(`ROOMRECEIVE: ${JSON.stringify(payload)}`);
    //   // setChatrooms(payload.roomsList);
    // }, []);

    const handleRoomsListReceived = useCallback((payload) => {
      console.log(`ROOMRECEIVE: ${JSON.stringify(payload)}`);
      setChatrooms(payload.rooms.map(room => ({ roomName: room })));
      console.log("chat rooms:", chatrooms);
    }, []);
    const handleDMRoomsListReceived = useCallback((payload) => {
      console.log(`ROOMDM: ${JSON.stringify(payload)}`);
      setChatrooms((prevChatrooms) => [...prevChatrooms, ...payload.dms.map(room => ({ roomName: room }))]);
      console.log("chat rooms2:", chatrooms);
    }, []);

    const handleRoomDeleted = useCallback((payload) => {
      // console.log("LEAVE", payload);
      setChatrooms((prevChatrooms) => {
        return prevChatrooms.filter((room) => room.roomName !== payload.roomName);
      });
    }, []);

    // Render handlers
    const handleChatroomClick = (chatroomId)=> {
      props.onListClick(chatroomId);
    }

    // Init
    useEffect(() => {
      // props.socket.emit("getRoomsList");
      props.socket.emit("getUserRooms");
      props.socket.emit("getDmsList");
    }, []);
    useEffect(() => {
      if (props.socket) {
        // console.log("The socket exists")
        // props.socket.on("roomsListReceived",handleRoomsList);
        props.socket.on("userRooms",handleRoomsListReceived);
        props.socket.on("dmsList",handleDMRoomsListReceived);
        props.socket.on("roomCreated", handleRoomCreated);
        props.socket.on("roomJoined", handleRoomJoined);
        props.socket.on("roomLeft", handleRoomDeleted );
        // console.log("received");
        // console.log(props.socket.listeners("roomsListReceived"));
        // console.log("created");
        // console.log(props.socket.listeners("roomCreated"));
        console.log("joined");
        console.log(props.socket.listeners("roomJoined"));
        // console.log("left");
        // console.log(props.socket.listeners("roomLeft"));
        // console.log("fake");
        // console.log(props.socket.listeners("fakeEvent"));
      return () => {
          // Log the event listeners to the console
          // props.socket.off("roomsListReceived", handleRoomsList);
          props.socket.off("userRooms",handleRoomsListReceived);
          props.socket.off("dmsList",handleDMRoomsListReceived);
          props.socket.off("roomCreated", handleRoomCreated);
          props.socket.off("roomJoined", handleRoomJoined);
          props.socket.off("roomLeft", handleRoomDeleted);
      }}
    }, [props.socket, handleRoomJoined]);

  // Render
  return (
    <div className="people-list" id="people-list">
            <div className="row">
            <div className="search col">
            {/* <button onClick={showdata}>Show data</button> */}
            <button  onClick={() => {setShowAddRoom(true);}} >New Room</button>
          <Modal   isVisible={showAddRoom}
            footer={<button>Cancel</button>}
            onClose={() => setShowAddRoom(false)} 
            socket={props.socket}/>
            </div>
            <div className="search col">
            <button onClick={() => {setShowJoinRoom(true);}}>Join Room</button>
          <RoomJoin isVisible={showJoinRoom}
            footer={<button>Cancel</button>}
            onClose={() => setShowJoinRoom(false)} 
            socket={props.socket}/>
            </div>
                <ul className="list">
                  <li className="clearfix">       
                    <div className="about">
                    <div className="name">Group A</div>
                    <div className="status"> Private <FontAwesomeIcon icon={faLock} /></div>
                    </div>
                  </li>
            {chatrooms.map(room => (
              <li className="clearfix"  key={room.roomName} onClick={() => handleChatroomClick(room.roomName)}>       
              <div className="about">
              <div className="name" >{room.roomName} 
              </div>
              <div className="status">
                  <i className="fa fa-circle online"></i> Protected <FontAwesomeIcon icon={faLock} />
                  </div>
              </div>
            </li>
            ))}
          </ul>
          </div>
        </div>
  );
}

