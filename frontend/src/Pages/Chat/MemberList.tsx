import React from 'react';
import { useRef, useEffect, useCallback } from "react";
import { useState } from 'react';
import { Socket } from "socket.io-client";
import { DatabaseContext } from './ChatLogin'
import { createContext, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faUnlock, faMessage, faTableTennis, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import "./chat.scss"
import ProfilePopup from './ProfilePopup';

interface MemberListProps {
    socket: Socket,
    onListClick: (list: string, id: number, ifDM: boolean) => void,
    roomName: string,
    UserId: Number,
    blockList : Number[],
}

export default function MemberList(props: MemberListProps) {
    const database = useContext(DatabaseContext);
    const [item, setItem] = useState([]);
    const [members, setMembers] = useState({ owner: '', admins: [], members: [] });
    const [showRoom, setShowRoom] = useState(false);
    const [newblockList, setNewBlockList] = useState([]);
    const [popUpId, setPopUpId] = useState({});

    const hanldeDM = (id, name) => {
        console.log("handleDM", id, name)
        props.onListClick(name, id, true);
        //   props.socket.emit("sendDM", )
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
    const handleProfilePopup = (user) =>{
        setShowRoom(true);
        setPopUpId(user)
    };
    useEffect(()=>{
        console.log(props.blockList);
        setNewBlockList(props.blockList);
    },[])
    const handleMemberList = useCallback((payload) => {
        setMembers(payload.memberList);
    }, [members])
    const handleMemberUpdate = useCallback((payload) => {
        console.log("handleMemberUpdate", payload)
        setMembers(payload.memberList);
    }, [members])
    const handleBlockUpdate = useCallback((payload) => {
        if (newblockList.includes(payload.userId) ==  false)
            setNewBlockList(array =>[...array, payload.userId]);
    }, [newblockList])
    const handleUnblockUpdate = useCallback((payload) => {
            setNewBlockList((prev) => {
                return prev.filter((id) => id !== payload.userId);
            });
    }, [newblockList])
    const handleAlertmessage = useCallback((payload) => {
        alert(payload.message);
    }, [])
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
        <div className="chat-info-header-2 clearfix">
            <div className='chat-info-member-list'>Liste des membres</div>
            <div className="row">
            {members && members.members.map((each, index) => {
                console.log("each", each)
            if (database) {
                let user = database.find((user) => user.id === each);
                let role = "Membre";
                if (members.owner.includes(each) == true)
                    role = "Proprio";
                else if (members.admins.includes(each) == true)
                    role = "Admin";
                return (
                    <>
                        <li className="clearfix col-lg-6 " key={each}>
                            <img className="img-member" src={user?.profilePicture} alt="avatar" />
                            <div className="about">
                                <div className="name ">{user.name}</div>
                                <div className="status">
                                    <i className="fa fa-circle online"></i> {role}</div>
                            </div>
                        </li>

                        {/* play, message, block */}
                        {user.id === props.UserId ?
                            <div className="col-lg-6"></div> :
                            (<div className="col-lg-6"><button className="PendingFriend-button" onClick={() => hanldeDM(user.id, user.name)}><FontAwesomeIcon icon={faMessage} size="lg" /></button>
                                { newblockList.includes(user.id) ? 
                                <><button onClick={() => handleUnblock(user.id, user.name)} ><FontAwesomeIcon icon={faUnlock}  size="lg" /></button> </> : 
                                <><button  onClick={() => handleblock(user.id, user.name)} ><FontAwesomeIcon icon={faLock} size="lg" /></button></>}
                                <button className="PendingFriend-button" onClick={() => handleProfilePopup(user)}><FontAwesomeIcon icon={faUser}  size="lg" /></button>
                                <button className="PendingFriend-button"onClick={() => handlePlay(user.id, user.name)} ><FontAwesomeIcon icon={faTableTennis}  size="lg" /></button>
                                
                            </div>)}
                    </>
                );
            }
        })}
                <ProfilePopup isVisible={showRoom}  onClose={() => setShowRoom(false)} user={popUpId}/>
            </div>
        </div>
    );
};