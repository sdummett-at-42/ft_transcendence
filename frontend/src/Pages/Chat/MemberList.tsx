import React from 'react';
import { useRef, useEffect, useCallback } from "react";
import { useState } from 'react';
import { Socket } from "socket.io-client";
import { DatabaseContext } from './ChatLogin'
import { createContext, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faUnlock, faMessage, faTableTennis, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import "./chat.scss"

interface MemberListProps {
    socket: Socket,
    onListClick: (list: string, id: number, ifDM: boolean) => void,
    roomName: string,
    UserId: Number,
}

export default function MemberList(props: MemberListProps) {
    const database = useContext(DatabaseContext);
    const [item, setItem] = useState([]);
    const [members, setMembers] = useState({ owner: '', admins: [], members: [] });

    const hanldeDM = (id, name) => {
        console.log("handleDM", id, name)
        props.onListClick(name, id, true);
        //   props.socket.emit("sendDM", )
    };

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
            //  console.log("members2222", members);
            setItem(members.members.map((each, index) => {
                if (database) {
                    let user = database.find((user) => user.id === each);
                    let role = "member";
                    if (members.owner.includes(each) == true)
                        role = "Owner";
                    else if (members.admins.includes(each) == true)
                        role = "Admin";
                    return (
                        <React.Fragment key={index}>
                            <li className="clearfix col-lg-6 " key={each}>
                                <img src={user.profilePicture} alt="avatar" />
                                <div className="about">
                                    <div className="name ">{user.name}</div>
                                    <div className="status">
                                        <i className="fa fa-circle online"></i> {role}</div>
                                </div>
                            </li>

                            {/* play, message, block */}
                            {user.id === props.UserId ? <div className="col-lg-6"></div> : (<div className="col-lg-6"><button className="PendingFriend-button" onClick={() => hanldeDM(user.id, user.name)}><FontAwesomeIcon icon={faMessage} size="lg" /></button>
                                <button className="PendingFriend-button"><FontAwesomeIcon icon={faLock} onClick={() => handleblock(user.id, user.name)} size="lg" /></button>
                                <button className="PendingFriend-button"><FontAwesomeIcon icon={faUnlock} onClick={() => handleUnblock(user.id, user.name)} size="lg" /></button>
                                <button className="PendingFriend-button"><FontAwesomeIcon icon={faUser} onClick={() => handleProfile(user.id, user.name)} size="lg" /></button>
                                <button className="PendingFriend-button"><FontAwesomeIcon icon={faTableTennis} onClick={() => handlePlay(user.id, user.name)} size="lg" /></button>
                                <button className="PendingFriend-button" ><FontAwesomeIcon icon={faEllipsisVertical} size="lg" /></button>
                            </div>)}
                        </React.Fragment>
                    );
                }
            })
            );
        }, [database, members]);
        const handleMemberList = useCallback((payload) => {
            setMembers(payload.memberList);
        }, [members])
        const handleMemberUpdate = useCallback((payload) => {
            console.log("handleMemberUpdate", payload)
            setMembers(payload.memberList);
        }, [members])
        useEffect(() => {
            props.socket.on("roomMembers", handleMemberList);
            props.socket.on("memberListUpdated", handleMemberUpdate);
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
                    props.socket.off("roomMembers", handleMemberList);
                    props.socket.off("memberListUpdated", handleMemberUpdate);
                    props.socket.off("userBlocked");
                    props.socket.off("userNotBlocked");
                    props.socket.off("userUnblocked");
                    props.socket.off("userNotUnblocked");
                }
            };
        }, [props.socket, handleMemberList, handleMemberUpdate]);
        return (
            <div className="chat-info-header-2 clearfix">
                <div className='chat-info-member-list'>Member List </div>
                <div className="row">
                    {item}
                </div>
            </div>
        );
    };