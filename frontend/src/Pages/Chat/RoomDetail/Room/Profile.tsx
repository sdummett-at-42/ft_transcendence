import React, { useEffect, useCallback, useState, useContext } from 'react';
import "../RoomDetail.css";
import { Socket } from "socket.io-client";
import { DatabaseContext } from '../../ChatLogin'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faUnlock, faTableTennis } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import { UserContext } from "./../../../../context/UserContext"
import Popup from '../../../Popup/Popup';
import SpecProfile from '../../../Profile/SpecProfile/SpecProfile';

interface ProfileProps {
    socket: Socket,
    roomName: string,
    UserId: Number,
    blockList : Number[],
}

export default function Profile(props: ProfileProps) {
    const database = useContext(DatabaseContext);
    const [user, setUser] = useState({});
    const [newblockList, setNewBlockList] = useState([]);
    const [isDuelOpen, setIsDuelOpen] = useState<boolean>(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
    const {gameSocketRef } = useContext(UserContext);
    const [popUpId, setPopUpId] = useState({});
    const [showRoom, setShowRoom] = useState(false);

    const handleUnblock = (id, name) => {
        const confirmed = window.confirm("Voulez-vous débloquer " + name + "?");
        if (confirmed) {
            const payload = {
                toUserId: id,
                fromUserId: props.UserId,
            }
            props.socket.emit("unblockUser", payload);
        }
    }

    const handleblock = (id, name) => {
        const confirmed = window.confirm("Voulez-vous bloquer " + name + "?");
        if (confirmed) {
            const payload = {
                toUserId: id,
                fromUserId: props.UserId,
            }
            props.socket.emit("blockUser", payload);
        }
    }

    const handleProfile = (id, name) => {
        const confirmed = window.confirm("Voulez-vous voir plus d'info sur " + name + "?");
    }

    const handlePlay = (id, name) => {
        const confirmed = window.confirm("Voulez-vous jouer au Ping avec " + name + "?");
        if (confirmed) {

        }
    }

    const handleAlertmessage = useCallback((payload) => {
        alert(payload.message);
    }, [])
    const navigate = useNavigate();
    const handleDuel = () => {
        setIsDuelOpen(!isDuelOpen);
        if (isOptionsOpen) {
            setIsOptionsOpen(false);
        }
    }
    const sendGameInvitationA = (friend) =>{
        // "ranked" | "custom"
        gameSocketRef.current.emit('sendInvitationGame',  { idTarget: friend.id, type: "ranked" })
        // alert("you have sent an invitation!A");
        // isDuelOpen(false);
        handleDuel()
       
    }

    const sendGameInvitationB = (friend) =>{
        gameSocketRef.current.emit('sendInvitationGame', { idTarget: friend.id, type: "custom"})   
        // alert("you have sent an invitation!B");
        // isDuelOpen(false);
        handleDuel()
    }
    

    const handleBlockUpdate = useCallback((payload) => {
        if (newblockList.includes(payload.userId) ==  false)
            setNewBlockList(array =>[...array, payload.userId]);
    }, [newblockList])
    const handleUnblockUpdate = useCallback((payload) => {
            setNewBlockList((prev) => {
                return prev.filter((id) => id !== payload.userId);
            });
    }, [newblockList])

    const handleProfilePopup = (user) =>{
        setShowRoom(true);
        setPopUpId(user)
    };

    useEffect(()=>{
        setNewBlockList(props.blockList);
    },[])
    
    useEffect(() => {

        if (database) {
            setUser(database.find((user) => user.name === props.roomName));
        }
    }, [props.roomName, user, database])

    useEffect(() => {
        if (props.socket) {
            props.socket.on("userBlocked", handleBlockUpdate);
            props.socket.on("userNotBlocked", handleAlertmessage);
            props.socket.on("userUnblocked", handleUnblockUpdate);
            props.socket.on("userNotUnblocked", handleAlertmessage);
            // props.socket.on("userBlockList", handleBlockList);
        }
        return () => {
            if (props.socket) {
                props.socket.off("userBlocked", handleBlockUpdate);
                props.socket.off("userNotBlocked", handleAlertmessage);
                props.socket.off("userUnblocked", handleUnblockUpdate);
                props.socket.off("userNotUnblocked", handleAlertmessage);
                // props.socket.off("userBlockList", handleBlockList);
            }
        };
    }, [props.socket, handleAlertmessage,handleBlockUpdate, handleUnblockUpdate, user]);
    return (user ? (
        <div className="RoomDetail Profile-screen-card-text">
            <div className="RoomDetail-screen-card">
				<div className="RoomDetail-screen-card-overlay"></div>
                <div className="RoomDetail-screen-card-content">
					<div className="RoomDetailProfile-screen-card-content-body">
                        <div>{user.name}</div>
                        <img src={user.profilePicture} className='ChatRoom-image' />
                        <p>Niveau : {user.elo}</p>
                        <div className="RoomDetailProfile-button-container">
                            <button className="PendingFriend-button"><FontAwesomeIcon icon={faUser} onClick={() => handleProfilePopup(user)} size="xl" /></button>
                            <div className="Friend-dropdown">
                        <button
                            className="PendingFriend-button"
                            onClick={() => handleDuel()}
                        >
                            <FontAwesomeIcon icon={faTableTennis} size="lg" />
                        </button>
                        {isDuelOpen && (
                            <div className="Friend-dropdown-content">
                                <div onClick={()=> sendGameInvitationA(user)}>Partie classée</div>
                                <div onClick={()=> sendGameInvitationB(user)}>Partie décontractée</div>
                            </div>
                        )}
                    </div>
                            {newblockList.includes(user.id) ? (
                                <div>
                                    <button onClick={() => handleUnblock(user.id, user.name)} className='PendingFriend-button'><FontAwesomeIcon icon={faUnlock} size="xl" /></button>
                                </div> 
                            ) : ( 
                                <div>
                                    <button  onClick={() => handleblock(user.id, user.name)} className='PendingFriend-button'><FontAwesomeIcon icon={faLock} size="xl" /></button>
                                </div>
                            )}
                      {  popUpId && (
                    <Popup isOpen={showRoom} isClose={() => {setShowRoom(false); setPopUpId("")}}>
                        <SpecProfile user={popUpId} handleUserClick={handleProfilePopup}/>
                    </Popup>
            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : null)
};