import React from 'react';
import { useRef, useEffect, useCallback } from "react";
import { useState } from 'react';
import { Socket } from "socket.io-client";
import { DatabaseContext } from './ChatLogin'
import { createContext, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faUnlock, faMessage, faTableTennis, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import "./chat.scss"

interface ProfileProps {
    socket: Socket,
    roomName: string,
    UserId: Number,
}

export default function Profile(props: ProfileProps) {
    const database = useContext(DatabaseContext);
    const [user, setUser] = useState({});

    const handleUnblock = (id, name) => {
        const confirmed = window.confirm("Are you sure you want unblock " + name + "?");
        if (confirmed) {
            const payload = {
                toUserId: id,
                fromUserId: props.UserId,
            }
            props.socket.emit("unblockUser", payload);
        }
    }

    const handleblock = (id, name) => {
        const confirmed = window.confirm("Are you sure you want block " + name + "?");
        if (confirmed) {
            const payload = {
                toUserId: id,
                fromUserId: props.UserId,
            }
            props.socket.emit("blockUser", payload);
        }
    }

    const handleProfile = (id, name) => {
        const confirmed = window.confirm("Are you sure you want see " + name + "'profile?");
    }

    const handlePlay = (id, name) => {
        const confirmed = window.confirm("Are you sure you want to play Ping with " + name + "?");
        if (confirmed) {

        }
    }
    useEffect(() => {
        if (database) {
            // console.log("databse exists!")
            setUser(database.find((user) => user.name === props.roomName));
            console.log("find", database.find((user) => user.name === props.roomName))
        }
    }, [props.roomName, user, database])

    useEffect(() => {
        props.socket.on("userBlocked", (payload) => {
            alert(payload.message);
        })
        props.socket.on("userNotBlocked", (payload) => {
            alert(payload.message);
        })
        props.socket.on("userUnblocked", (payload) => {
            alert(payload.message);
        });
        props.socket.on("userNotUnblocked", (payload) => {
            alert(payload.message);
        });
        return () => {
            if (props.socket) {
                props.socket.off("userBlocked");
                props.socket.off("userNotBlocked");
                props.socket.off("userUnblocked");
                props.socket.off("userNotUnblocked");
            }
        };
    }, [props.socket]);
    return (
        user? 
        <div className="chatinfo">
            <div className="chat-info-header clearfix">
            <div className='chat-info-title'>Profile:{user.name} </div>
            <button className="PendingFriend-button"><FontAwesomeIcon icon={faLock} onClick={() => handleblock(user.id, user.name)} size="lg" /></button>
            <button className="PendingFriend-button"><FontAwesomeIcon icon={faUnlock} onClick={() => handleUnblock(user.id, user.name)} size="lg" /></button>
            <button className="PendingFriend-button"><FontAwesomeIcon icon={faUser} onClick={() => handleProfile(user.id, user.name)} size="lg" /></button>
            <button className="PendingFriend-button"><FontAwesomeIcon icon={faTableTennis} onClick={() => handlePlay(user.id, user.name)} size="lg" /></button>
            <button className="PendingFriend-button" ><FontAwesomeIcon icon={faEllipsisVertical} size="lg" /></button>
            </div></div> : null)
};