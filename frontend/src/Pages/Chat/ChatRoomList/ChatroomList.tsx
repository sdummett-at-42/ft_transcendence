import React, { useState, useEffect, useCallback, useContext } from 'react';
import "./ChatRoomList.css";
import RoomCreate from "../RoomCreate/RoomCreate";
import RoomJoin from '../RoomJoin/RoomJoin';
import group from "../../../assets/group.png"
import Popup from '../../Popup/Popup';
import { Socket } from "socket.io-client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { DatabaseContext } from '../ChatLogin';
import InvitedConfirm from '../Popup/InvitedConfirm';

interface ChatroomListProps {
    socket: Socket,
    onListClick: (list: string, id: number, ifDM: boolean) => void,
    onUpdate: () => void,
    ifDM: boolean,
    toDMID: {
        id: number;
        name: string;
    };
    ifDataReady: boolean,
}

export default function ChatroomList(props: ChatroomListProps) {
    // States
    const [chatrooms, setChatrooms] = useState([]);
    const [dms, setdms] = useState([]);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [showJoinRoom, setShowJoinRoom] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState("");
    const database = useContext(DatabaseContext);
    const [showConfirm, setShowConfirm] = useState(false);
    const [message, setMessage] = useState("");
    const [roomNameInvite, setRoomNameInvite] = useState("");

    // Event handlers
    const handleRoomCreated = useCallback((payload) => {
    }, [chatrooms]);

    const handleRoomJoined = useCallback((payload) => {
        if (chatrooms.find(obj => obj.roomName === payload.roomName))
            return;
        setChatrooms((prevChatrooms) => [...prevChatrooms, {
            roomName: payload.roomName,
            public: payload.public,
            protected: payload.protected
        }]);
        props.onUpdate(); //update database!
    }, [chatrooms]);

    const handleRoomsListReceived = useCallback((payload) => {
        setChatrooms(payload.roomsList);
    }, [chatrooms]);
  
    const handleDMRoomsListReceived = useCallback((payload) => {
        setdms(payload.dms);
        if (database) {
            const filteredObjects = database.filter(obj => payload.dms.includes(obj.id));
            const newDms = filteredObjects.map(obj => ({ id: obj.id, name: obj.name, prof: obj.profilePicture }));
            setdms(newDms);
        }
    }, [setdms, database]);

    const handlDMlistupdated = useCallback((payload) => {
        if (dms.find(obj => obj.id === payload.userId))
            return;
        if (database) {
            const filteredObjects = database.find(obj => obj.id === payload.userId);
            if (!payload.fromId) {
                alert(filteredObjects.name + " vous avait envoyé un message !");
            }
            if (filteredObjects) {
                setdms((prevdms) => [...prevdms, {
                    id: filteredObjects?.id,
                    name: filteredObjects.name,
                    prof: filteredObjects.profilePicture
                }]);
            }
        }
    }, [dms]);

    const handleRoomDeleted = useCallback((payload) => {
        setChatrooms((prevChatrooms) => {
            return prevChatrooms.filter((room) => room.roomName !== payload.roomName);
        });
        if (selectedRoom == payload.roomName){
            setSelectedRoom("");
            props.onListClick("", 0, false);
        }
    }, [chatrooms]);

    const handleBanEvent = useCallback((payload) => {
        alert(payload.message);
        setChatrooms((prevChatrooms) => {
            return prevChatrooms.filter((room) => room.roomName !== payload.roomName);
        });
        // if (selectedRoom == payload.roomName){
        setSelectedRoom("");
        props.onListClick("", 0, false);
    }, [chatrooms]);

    const handleKickEvent = useCallback((payload) => {
        alert(payload.message);
        setChatrooms((prevChatrooms) => {
            return prevChatrooms.filter((room) => room.roomName !== payload.roomName);
        });
  
        setSelectedRoom("");
        props.onListClick("", 0, false);
    }, [chatrooms]);

    const handleRoomsUpdate = useCallback((payload) => {
        const chatroomIndex = chatrooms.findIndex(room => room.roomName === payload.roomName);
        if (chatroomIndex === -1) {
            return;
        }
        const updatedChatroom = {
            ...chatrooms[chatroomIndex],
            public: payload.public,
            protected: payload.protected
        };
        const updatedChatrooms = [...chatrooms];
        updatedChatrooms[chatroomIndex] = updatedChatroom;
        setChatrooms(updatedChatrooms);
    }, [chatrooms]);

    // Render handlers
    const handleChatroomClick = (roomName, userID, ifDM) => {
        if (ifDM == false) {
            props.onListClick(roomName, 0, false);
            props.socket.emit("getRoomMembers", { roomName: roomName });
            setSelectedRoom(roomName);
        } else {
            props.onListClick(roomName, userID, true);
            props.socket.emit("getDmHist", { userId: userID });
            setSelectedRoom(roomName);
        }
    };
    const handleInvited = useCallback((payload) => {
        setMessage(payload.message);
        setRoomNameInvite(payload.roomName);
        setShowConfirm(true);
      }, [])

    useEffect(() => {
        if (!database) {
            props.onUpdate();
        }
    }, []);

    useEffect(() => {
        if (props.socket) {
            props.socket.on("userRooms", handleRoomsListReceived);
            props.socket.on("dmsList", handleDMRoomsListReceived);
            props.socket.on("roomCreated", handleRoomCreated);
            props.socket.on("roomJoined", handleRoomJoined);
            props.socket.on("roomUpdated", handleRoomsUpdate);
            props.socket.on("roomLeft", handleRoomDeleted);
            props.socket.on("dmUpdated", handlDMlistupdated);
            props.socket.on("banned", handleBanEvent);
            props.socket.on("kicked", handleKickEvent);
            props.socket.on("invited", handleInvited);
        }
        return () => {
            if (props.socket) {
                // Log the event listeners to the console
                props.socket.off("userRooms", handleRoomsListReceived);
                props.socket.off("dmsList", handleDMRoomsListReceived);
                props.socket.off("roomCreated", handleRoomCreated);
                props.socket.off("roomJoined", handleRoomJoined);
                props.socket.off("roomLeft", handleRoomDeleted);
                props.socket.off("roomUpdated", handleRoomsUpdate);
                props.socket.off("dmUpdated", handlDMlistupdated);
                props.socket.off("banned", handleBanEvent);
                props.socket.off("kicked", handleKickEvent);
                props.socket.off("invited", handleInvited);
            }
        }
    }, [
        props.socket,
        handleRoomsListReceived,
        handleDMRoomsListReceived,
        handleRoomCreated,
        handleRoomJoined,
        handleRoomDeleted, 
        handleRoomsUpdate,
        handlDMlistupdated,
        handleBanEvent,
        handleKickEvent,
        handleInvited
    ]);

    // Render
    return (
        <div className="ChatRoomList">
            <div className="ChatRoom-screen-card">
						    <div className="ChatRoom-screen-card-overlay"></div>
                <div className="ChatRoom-screen-card-content">
							      <div className="ChatRoom-screen-card-content-body">
                        <div className="ChatRoom-screen-card-user">
                            <button
                                className='Settings-button'
                                onClick={() => setShowAddRoom(true)}
                            >
                                Creer un salon
                            </button>
                            <button
                                className='Settings-button'
                                onClick={() => setShowJoinRoom(true)}
                            >
                                Rejoindre un salon
                            </button>
                        </div>
                        <ul className='ChatRoom-list-ul'>
                            {chatrooms.map(room => (
                                <li
                                    className={`ChatRoom-list-li ${selectedRoom === room.roomName && !props.ifDM ? "ChatRoom-active" : ""}`}
                                    key={room.roomName}
                                    onClick={() => handleChatroomClick(room.roomName, 0, false)}
                                >
                                    <img src={group} className='ChatRoom-image' draggable={false} />
                                    <div>
                                        <div className="ChatRoom-screen-card-text">
                                            {room.roomName}
                                        </div>
                                        <div className="ChatRoom-screen-card-type">
                                            <i className="" />
                                            {room.public === "public" ? "Public " : "Privé"}
                                            {room.protected ? <FontAwesomeIcon icon={faLock} /> : null}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <ul className="ChatRoom-list-ul">
                            {dms.map(room => (
                                <li className={`ChatRoom-list-li ${(selectedRoom === room.name) || (props.toDMID.name === room.name && props.ifDM) ? "ChatRoom-active" : ""}`} key={room.id} onClick={() => handleChatroomClick(room.name, room.id, true)}>
                                    <img src={room.prof} className='ChatRoom-image' draggable={false} />
                                    <div className="ChatRoom-screen-card-text" >
                                        {room.name}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
              </div>
          </div>
          {/* Popup */}
          {setShowAddRoom && (
              <Popup isOpen={showAddRoom} isClose={() => setShowAddRoom(false)}>
                  <RoomCreate
                      isVisible={showAddRoom}
                      onClose={() => setShowAddRoom(false)}
                      socket={props.socket}
                  />
              </Popup>
          )}

          {setShowJoinRoom && (
              <Popup isOpen={showJoinRoom} isClose={() => setShowJoinRoom(false)}>
                  <RoomJoin isVisible={showJoinRoom}
                      footer={<button>Cancel</button>}
                      onClose={() => setShowJoinRoom(false)}
                      socket={props.socket}
                  />
              </Popup>
          )}
            <Popup isOpen={showConfirm} isClose={() => setShowConfirm(false)}>
                    <InvitedConfirm
                        isVisible={showConfirm}
                        RoomName={roomNameInvite}
                        onClose={() => setShowConfirm(false)}
                        socket={props.socket}
                        message={message}
                    />
            </Popup>
      </div>
    );
}

