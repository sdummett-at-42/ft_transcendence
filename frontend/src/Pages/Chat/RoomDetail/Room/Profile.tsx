import React, { useEffect, useCallback, useState, useContext } from 'react';
import "../RoomDetail.css";
import { Socket } from "socket.io-client";
import { DatabaseContext } from '../../ChatLogin'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faUnlock, faTableTennis } from "@fortawesome/free-solid-svg-icons";

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
    

    const handleBlockUpdate = useCallback((payload) => {
        if (newblockList.includes(payload.userId) ==  false)
            setNewBlockList(array =>[...array, payload.userId]);
    }, [newblockList])
    const handleUnblockUpdate = useCallback((payload) => {
            setNewBlockList((prev) => {
                return prev.filter((id) => id !== payload.userId);
            });
    }, [newblockList])

    useEffect(()=>{
        console.log(props.blockList);
        setNewBlockList(props.blockList);
    },[])
    
    useEffect(() => {
        console.log("databse exists!")
        if (database) {
            console.log("profile databse exists!")
            setUser(database.find((user) => user.name === props.roomName));
            console.log("find", database.find((user) => user.name === props.roomName))
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
                            <button className="PendingFriend-button"><FontAwesomeIcon icon={faUser} onClick={() => handleProfile(user.id, user.name)} size="xl" /></button>
                            <button className="PendingFriend-button"><FontAwesomeIcon icon={faTableTennis} onClick={() => handlePlay(user.id, user.name)} size="xl" /></button>
                            {newblockList.includes(user.id) ? (
                                <div>
                                    <button onClick={() => handleUnblock(user.id, user.name)} className='PendingFriend-button'><FontAwesomeIcon icon={faUnlock} size="xl" /></button>
                                </div> 
                            ) : ( 
                                <div>
                                    <button  onClick={() => handleblock(user.id, user.name)} className='PendingFriend-button'><FontAwesomeIcon icon={faLock} size="xl" /></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : null)
};