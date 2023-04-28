import React, { useEffect, useCallback, useState, useContext } from 'react';
import "./Room.css";
import Popup from '../../../Popup/Popup';
import SpecProfile from '../../../Profile/SpecProfile/SpecProfile';
import { Socket } from "socket.io-client";
import { DatabaseContext } from '../../ChatLogin'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUnlock, faMessage, faTableTennis } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import { UserContext } from "./../../../../context/UserContext"

interface MemberListProps {
    socket: Socket,
    onListClick: (list: string, id: number, ifDM: boolean) => void,
    roomName: string,
    UserId: Number,
    blockList : Number[],
}

export default function MemberList(props: MemberListProps) {
    const database = useContext(DatabaseContext);
    const [members, setMembers] = useState({ owner: '', admins: [], members: [] });
    const [showRoom, setShowRoom] = useState(false);
    const [newblockList, setNewBlockList] = useState([]);
    const [popUpId, setPopUpId] = useState({});
    const [isDuelOpen, setIsDuelOpen] = useState<boolean>(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
    const { gameSocketRef } = useContext(UserContext);

    const hanldeDM = (id, name) => {
        props.onListClick(name, id, true);
    };

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

    const handlePlay = (id, name) => {
        const confirmed = window.confirm("Voulez-vous jouer au Ping avec " + name + "?");
        if (confirmed) {

        }
    }
    const navigate = useNavigate();
    const handleDuel = () => {
        setIsDuelOpen(!isDuelOpen);
        if (isOptionsOpen) {
            setIsOptionsOpen(false);
        }
    }

    const handleOptions = () => {
        setIsOptionsOpen(!isOptionsOpen);
        if (isDuelOpen) {
            setIsDuelOpen(false);
        }
    }
    const sendGameInvitationA = (friend) =>{
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

    const handleProfilePopup = (user) =>{
        setShowRoom(true);
        setPopUpId(user)
    };

    useEffect(()=>{
        setNewBlockList(props.blockList);
    },[]);

    const handleMemberList = useCallback((payload) => {
        setMembers(payload.memberList);
    }, [members]);

    const handleMemberUpdate = useCallback((payload) => {
        setMembers(payload.memberList);
    }, [members]);

    const handleBlockUpdate = useCallback((payload) => {
        if (newblockList.includes(payload.userId) ==  false)
            setNewBlockList(array =>[...array, payload.userId]);
    }, [newblockList]);

    const handleUnblockUpdate = useCallback((payload) => {
            setNewBlockList((prev) => {
                return prev.filter((id) => id !== payload.userId);
            });
    }, [newblockList]);

    const handleAlertmessage = useCallback((payload) => {
        alert(payload.message);
    }, []);

    useEffect(() => {
        if (props.socket) {
            props.socket.on("roomMembers", handleMemberList);
            props.socket.on("memberListUpdated", handleMemberUpdate);
            props.socket.on("userBlocked", handleBlockUpdate);
            props.socket.on("userNotBlocked", handleAlertmessage);
            props.socket.on("userUnblocked", handleUnblockUpdate);
            props.socket.on("userNotUnblocked", handleAlertmessage);
            // props.socket.on("userBlockList", handleBlockList);
        }
        return () => {
            if (props.socket) {
                props.socket.off("roomMembers", handleMemberList);
                props.socket.off("memberListUpdated", handleMemberUpdate);
                props.socket.off("userBlocked", handleBlockUpdate);
                props.socket.off("userNotBlocked", handleAlertmessage);
                props.socket.off("userUnblocked", handleUnblockUpdate);
                props.socket.off("userNotUnblocked", handleAlertmessage);
                // props.socket.off("userBlockList", handleBlockList);
            }
        };
    }, [props.socket, handleMemberList, handleMemberUpdate, handleAlertmessage,handleBlockUpdate, handleUnblockUpdate]);

    return (
        <div>
            <div className='Profile-screen-card-text RoomList-header'>Liste des membres</div>
            {members && members.members.map((each, index) => {
                if (database) {
                    let user = database.find((user) => user.id === each);
                    let role = "Membre";
                    if (members.owner.includes(each) == true) {
                        role = "Propriétaire";
                    }
                    else if (members.admins.includes(each) == true) {
                        role = "Administateur";
                    }
                    return (
                        <li className="ChatRoom-list-li" key={each} onClick={() => handleProfilePopup(user)}>
                            <img className="ChatRoom-image" src={user?.profilePicture} alt="avatar" />
                            <div className="about">
                                <div className="MemberList-screen-card-text">{user?.name}</div>
                                <div className="ChatRoom-screen-card-type">
                                    {role}
                                </div>
                            </div>
                            {user?.id === props?.UserId ?
                                <div></div> :
                                (
                                    <div className="MemberList-button">
                                        <button className="PendingFriend-button" onClick={() => hanldeDM(user.id, user.name)}><FontAwesomeIcon icon={faMessage} size="lg" /></button>
                                        <button className="PendingFriend-button" onClick={() => handleDuel()}><FontAwesomeIcon icon={faTableTennis} size="lg" /></button>
                                        {isDuelOpen && (
                                            <div className="Friend-dropdown-content">
                                                <div onClick={()=> sendGameInvitationA(user)}>Partie classée</div>
                                                <div onClick={()=> sendGameInvitationB(user)}>Partie décontractée</div>
                                            </div>
                                        )}
                                        {newblockList.includes(user?.id) ? (
                                            <div>
                                                <button className="PendingFriend-button" onClick={() => handleUnblock(user.id, user.name)} ><FontAwesomeIcon icon={faUnlock}  size="lg" /></button>
                                            </div>
                                        ) : ( 
                                            <div>
                                                <button className="PendingFriend-button" onClick={() => handleblock(user.id, user.name)} ><FontAwesomeIcon icon={faLock} size="lg" /></button>
                                            </div>
                                        )}
                                    </div>
                                )
                            }
                        </li>
                    );
                }
            })}
            {popUpId && (
                <Popup isOpen={showRoom} isClose={() => {setShowRoom(false); setPopUpId("")}}>
                    <SpecProfile user={popUpId} handleUserClick={handleProfilePopup}/>
                </Popup>
            )}
        </div>
    );
};