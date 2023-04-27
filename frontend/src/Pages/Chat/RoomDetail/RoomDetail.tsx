import React, { useState, useEffect, useCallback, useContext } from 'react';
import "./RoomDetail.css"
import Setting from '../Popup/Setting';
import InvitedConfirm from '../Popup/InvitedConfirm';
import MemberList from './Room/MemberList';
import Profile from './Room/Profile';
import Moderation from '../Popup/Moderation';
import Popup from '../../Popup/Popup';
import { Socket } from "socket.io-client";
import { DatabaseContext } from '../ChatLogin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface RoomDetailProps {
  socket: Socket,
  onListClick: (list: string, id: number, ifDM: boolean) => void,
  roomName: string,
  onUpdate: () => void,
  UserId: Number,
  ifDM: boolean,
  blockList : Number[],
}
export default function RoomDetail(props: RoomDetailProps) {
  const [show, setShow] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const [inputInvite, setInputInvite] = useState("");
  const [errorMessage, setErrorMessage] = useState({});
  const [input, setInput] = useState("");
  const database = useContext(DatabaseContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [roomNameInvite, setRoomNameInvite] = useState("");
  const [userId, setUserId] = useState(0);
  const [ifAdmin, setIfAdmin] = useState(false);
  const [adminList, setAdminList] = useState([]);
  const [moderation, setModeration] = useState({
    data: "Muet",
  });

  const findInDatabase = (name) => {
    let user = database.find((us) => us.name === name);

    if (user === undefined) {
        props.onUpdate();
        const interval = setInterval(() => {
            user = database.find((user) => user.name === name);
            if (user !== undefined) {
                clearInterval(interval);
                return user.id;
            }
            else {
                setErrorMessage((prev) => ({
                    ...prev,
                    invite: "Utilisateur non trouvé.",
                }));
                return;
            }
        }, 1000);
    } else {
        return user.id;
    }
  };

  const handleInvite = () => {
    let user = findInDatabase(inputInvite);
    if (user == 0) {
      setErrorMessage((prev) => ({
        ...prev,
        invite: "Utilisateur non trouvé.",
      }));
      return;
    }
    const payload = {
      roomName: props.roomName,
      userId: user,
    }
    props.socket.emit("inviteUser", payload);
    setInputInvite("");
    setErrorMessage((prev) => ({
      ...prev,
      invite: "",
    }));
    return;
  }

  const handleInvited = useCallback((payload) => {
    setMessage(payload.message);
    setRoomNameInvite(payload.roomName);
    setShowConfirm(true);
  }, [])

  const handleNotInvite = useCallback((payload) => {
    setErrorMessage((prev) => ({
      ...prev,
      invite: payload.message,
  }));
  }, [])

  const handleAdminList = useCallback((payload) => {
    setAdminList(payload.memberList.admins);
  }, [props.UserId, adminList])

  const handleCheckIfAdmin = useCallback((payload) => {
    if (payload.roomName !== props.roomName) {
      return;
    }
    setAdminList(payload.memberList.admins);
  }, [props.UserId, props.roomName, ifAdmin, adminList])

  const handleMessagAction = useCallback((payload)=>{
    // Popup d'alerte
    // alert(payload.message);
    setInput("")
  },[])

  useEffect(()=>{
    if (!database){
      props.onUpdate();
    }
  },[])

  useEffect(() => {
    if (adminList.includes(props.UserId))
      setIfAdmin(true);
    else
      setIfAdmin(false);
  }, [adminList]);

  useEffect(() => {
    if(props.socket){
      props.socket.on("invited", handleInvited);
      props.socket.on("userNotInvited", handleNotInvite);
      props.socket.on("memberListUpdated", handleCheckIfAdmin);
      props.socket.on("roomMembers", handleAdminList);
      props.socket.on("userNotBanned", handleMessagAction);
      props.socket.on("userBanned", handleMessagAction);
      props.socket.on("userNotUnbanned", handleMessagAction);
      props.socket.on("unbanned", handleMessagAction);
      props.socket.on("userNotMuted", handleMessagAction);
      props.socket.on("userMuted", handleMessagAction);
      props.socket.on("userNotKicked", handleMessagAction);
      props.socket.on("userKicked", handleMessagAction);
    }
    return () => {
      if(props.socket){
        props.socket.off("invited", handleInvited);
        props.socket.off("userNotInvited", handleNotInvite);
        props.socket.off("memberListUpdated", handleCheckIfAdmin);
        props.socket.off("roomMembers", handleAdminList);
        props.socket.off("userNotBanned", handleMessagAction);
        props.socket.off("userBanned", handleMessagAction);
        props.socket.off("userNotUnbanned", handleMessagAction);
        props.socket.off("unbanned", handleMessagAction);
        props.socket.off("userNotMuted", handleMessagAction);
        props.socket.off("userMuted", handleMessagAction);
        props.socket.off("userNotKicked", handleMessagAction);
        props.socket.off("userKicked", handleMessagAction);
      }
    };
  }, [props.socket,database, handleInvited, handleNotInvite, handleCheckIfAdmin,handleAdminList, handleMessagAction]);

  return (
    (!props.ifDM) && props.roomName ? (
        <div className="RoomDetail">
            <div className="RoomDetail-screen-card">
						    <div className="RoomDetail-screen-card-overlay"></div>
                    <div className="RoomDetail-screen-card-content">
							          <div className="RoomDetail-screen-card-content-body">
                            {ifAdmin ? (
                                <div>
                                    <div className="RoomDetail-screen-card-user">
                                        <button onClick={() => setShow(true)} className='Settings-button'>Paramètre</button>
                                    </div>
                                    <div className="RoomDetail-screen-card-user">
                                        <button onClick={() => setShowSetting(true)} className='Settings-button'>Modération</button>
                                    </div>
                              </div>
                            ) : null}
                            <div className="RoomDetail-screen-card-user-invite">
                                <div className='Profile-screen-card-text'>Inviter</div>
                                <div className="RoomDetail-screen-card-input-wrapper">
                                    <input placeholder="Nom" className='RoomDetail-screen-card-input' value={inputInvite} onChange={(e) => setInputInvite(e.target.value)} />
                                    <button onClick={handleInvite} className='RoomDetail-button-invite'><FontAwesomeIcon icon={faPlus} size='xl'/></button>
                                </div>
                                {errorMessage.invite && (<div className='Settings-error'>{errorMessage.invite}</div>)}
                            </div>
                            <MemberList socket={props.socket} onListClick={props.onListClick} roomName={props.roomName} UserId={props.UserId} blockList={props.blockList}/>
                        </div>
                    </div>
                </div>
                <Popup isOpen={show} isClose={() => setShow(false)}>
                    <Setting 
                        isVisible={show}
                        socket={props.socket}
                        onClose={() => setShow(false)}
                        roomName={props.roomName}
                        onUpdate={props.onUpdate}
                    />
                </Popup>

                <Popup isOpen={showSetting} isClose={() => setShowSetting(false)}>
                    <Moderation 
                      isVisible={showSetting}
                      socket={props.socket}
                      onClose={() => setShowSetting(false)}
                      roomName={props.roomName}
                      onUpdate={props.onUpdate}
                    />
                </Popup>

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
      ) : (
          (props.ifDM) ? (
              <Profile socket={props.socket} roomName={props.roomName} UserId={props.UserId} blockList={props.blockList} />
          ) : (
              <div className=""></div>
          )
      )

  );
}

