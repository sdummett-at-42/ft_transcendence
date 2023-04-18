import React, { FC } from 'react';
import { useState, useEffect, useCallback, useContext} from 'react';
import RoomCreate from "./RoomCreate";
import { io, Socket } from "socket.io-client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock} from '@fortawesome/free-solid-svg-icons';
import RoomJoin from './RoomJoin';
import "./chat.scss"
import InvitedConfirm from './InvitedConfirm';
import { DatabaseContext } from './ChatLogin';

interface ChatroomListProps {
  socket: Socket,
  onListClick : (list: string,id:number, ifDM: boolean) => void,
  onUpdate:() =>void,
  ifDM : boolean,
  toDMID: {
    id: number;
    name: string;
  };
  ifDataReady : boolean,
}
export default function ChatroomList(props: ChatroomListProps) {
    // States
    const [chatrooms, setChatrooms] = useState([]);
    const [dms, setdms] = useState([]);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [showJoinRoom, setShowJoinRoom] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState("");
    const database = useContext(DatabaseContext);

    // Event handlers
    const handleRoomCreated = useCallback((payload) => {
      // console.log("created", payload);
    }, [chatrooms]);

    const handleRoomJoined = useCallback((payload) => {
      // console.log("handleRoomJoined", payload);
      setChatrooms((prevChatrooms) => [...prevChatrooms, {
        roomName: payload.roomName,
        public : payload.public,
        protected : payload.protected
      }]);
      props.onUpdate(); //update database!
    }, [chatrooms]);

    const handleRoomsListReceived = useCallback((payload) => {
      // console.log("handleRoomsListReceived", payload);
      setChatrooms(payload.roomsList);
      // console.log("chat rooms:", chatrooms);
    }, [chatrooms]);
    const handleDMRoomsListReceived = useCallback((payload) => {
      if (database) {
        const filteredObjects = database.filter(obj => payload.dms.includes(obj.id));
        // console.log("database:", database);
        // console.log("include", filteredObjects);
        const newDms = filteredObjects.map(obj => ({id: obj.id, name: obj.name}));
        setdms(newDms);
      }
    }, [dms, database]);
    const handlDMlistupdated = useCallback((payload) => {
      console.log("ROOMdmUPADTE:", payload );
      setdms(payload.dms);
    }, [dms]);

    const handleRoomDeleted = useCallback((payload) => {
      // console.log("LEAVE", payload);
      setChatrooms((prevChatrooms) => {
        return prevChatrooms.filter((room) => room.roomName !== payload.roomName);
      });
    }, [chatrooms]);

    const handleRoomsUpdate = useCallback ((payload) =>{
      console.log("handleRoomsUpdate", payload, chatrooms);
      const chatroomIndex = chatrooms.findIndex(room => room.roomName === payload.roomName);
      if (chatroomIndex === -1) {
        console.log("cant not find the roomname updated");
        return;
      }
      const updatedChatroom = {...chatrooms[chatroomIndex], 
        public : payload.public,
        protected : payload.protected};
      const updatedChatrooms = [...chatrooms];
      updatedChatrooms[chatroomIndex] = updatedChatroom;
      setChatrooms(updatedChatrooms);
    }, [chatrooms]);

    // Render handlers
    const handleChatroomClick = (roomName, userID,  ifDM)=> {
      console.log("handleChatroomClick", roomName, userID, ifDM);
      if (ifDM ==  false){
        props.onListClick(roomName, 0, false);
        props.socket.emit("getRoomMembers", { roomName:roomName});
        setSelectedRoom(roomName);
      } else{
        props.onListClick(roomName, userID, true)
        props.socket.emit("getDmHist", {userId: userID});
        setSelectedRoom(roomName);
      }
    }

    // Init
    useEffect(() => {
      // props.socket.emit("getRoomsList");
      props.socket.emit("getUserRooms");
      props.socket.emit("getDmsList");
    }, []);
    useEffect(() => {
      if (props.socket && props.ifDataReady) {
        // console.log("The socket exists")
        // props.socket.on("roomsListReceived",handleRoomsList);
        props.socket.on("userRooms",handleRoomsListReceived);
        props.socket.on("dmsList",handleDMRoomsListReceived);
        props.socket.on("roomCreated", handleRoomCreated);
        props.socket.on("roomJoined", handleRoomJoined);
        props.socket.on("roomUpdated", handleRoomsUpdate);
        props.socket.on("roomLeft", handleRoomDeleted);
        props.socket.on("DMReceived", handlDMlistupdated);
        // console.log("received");
        // console.log(props.socket.listeners("roomsListReceived"));
      return () => {
          // Log the event listeners to the console
          // props.socket.off("roomsListReceived", handleRoomsList);
          props.socket.off("userRooms",handleRoomsListReceived);
          props.socket.off("dmsList",handleDMRoomsListReceived);
          props.socket.off("roomCreated", handleRoomCreated);
          props.socket.off("roomJoined", handleRoomJoined);
          props.socket.off("roomLeft", handleRoomDeleted);
          props.socket.off("roomUpdated", handleRoomsUpdate);
          props.socket.off("DMReceived", handlDMlistupdated);
      }}
    }, [props.socket, props.ifDataReady, database, handleRoomJoined, selectedRoom, props.ifDM]);

  // Render
  return (
    <div className="people-list col-lg-3" id="people-list">
            <div className="row">
            <div className="search col-lg-6">
            {/* <button onClick={showdata}>Show data</button> */}
            <button  onClick={() => {setShowAddRoom(true);}} >New Room</button>
          <RoomCreate   isVisible={showAddRoom}
            onClose={() => setShowAddRoom(false)} 
            socket={props.socket}/>
            </div>
            <div className="search col-lg-6">
            <button onClick={() => {setShowJoinRoom(true);}}>Join Room</button>
          <RoomJoin isVisible={showJoinRoom}
            footer={<button>Cancel</button>}
            onClose={() => setShowJoinRoom(false)} 
            socket={props.socket}/>
            </div>
                <ul className="list col-lg-12">
                  {chatrooms.map(room => (
                  <li className={`clearfix ${selectedRoom === room.roomName && !props.ifDM ? "active" : ""}`}  key={room.roomName} onClick={() => handleChatroomClick(room.roomName, 0 , false)}>       
                    <div className="about"> <div className="name" >{room.roomName} </div>
                    <div className="status">
                      <i className="fa fa-circle online"></i> {room.public === "public" ? "Public " : "Private"} {room.protected?  <FontAwesomeIcon icon={faLock} /> :null}
                    </div>
                    </div>
                  </li>
                  ))}
                </ul>
                <ul className="list col-lg-12">
                  {dms.map(room => (
                  <li className={`clearfix ${(selectedRoom === room.name) || (props.toDMID.name === room.name && props.ifDM) ? "active" : ""}`}   key={room.id} onClick={() => handleChatroomClick(room.name, room.id, true)}>       
                    <div className="about"> <div className="name" >{room.name} </div>
                    <div className="status">
                      <i className="fa fa-circle online"></i> 
                    </div>
                    </div>
                  </li>
                  ))}
                </ul>
            </div>
        </div>
  );
}

