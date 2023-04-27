import React, { useState, useEffect, useCallback, useContext } from 'react';
import "./RoomDetail.css"
import Setting from './Room/Setting';
import InvitedConfirm from '../InvitedConfirm';
import MemberList from './Room/MemberList';
import Profile from './Room/Profile';
import { Socket } from "socket.io-client";
import { DatabaseContext } from '../ChatLogin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Popup from '../../Popup/Popup';

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
    let user = database.find((user) => user.name === name);
    if (user === undefined) {
      props.onUpdate();
      const interval = setInterval(() => {
        user = database.find((user) => user.name === name);
        if (user !== undefined) {
          clearInterval(interval);
          setUserId(user.id);
          alert("Utilisateur non trouvé. Veuillez réessayer.");
        }
      }, 1000);
    } else {
      setUserId(user.id);
    }
    return userId;
  };

  const handleInvite = () => {
    let userId = findInDatabase(inputInvite);
    if (userId == 0) {
      alert("Utilisateur non trouvé. Veuillez réessayer.");
      return;
    }
    const payload = {
      roomName: props.roomName,
      userId: userId,
    }
    props.socket.emit("inviteUser", payload);
    setInputInvite("");
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setModeration({
      ...moderation,
      [name]: value
    });
  };

  const handleModeration = () => {
    if (!input) {
      alert("Veuillez entrer un nom d'utilisateur.");
      return;
    }
    if (moderation.data === "Muet") {
      handleMute();
    } else if (moderation.data === "Bannir") {
      handleBan();
    } else if (moderation.data === "Débannir") {
      handleUnBan();
    } else if (moderation.data === "Sortir") {
      handleKick();
    }
  }

  const handleBan = () => {
    let userId = findInDatabase(input);
    if (userId == 0) {
      alert("Utilisateur non trouvé. Veuillez réessayer.");
      return;
    }
    const payload = {
      roomName: props.roomName,
      userId: userId,
    }
    props.socket.emit("banUser", payload);
    setInput("");
    setShowSetting(false);
  }
  const handleUnBan = () => {
    let userId = findInDatabase(input);
    if (userId == 0) {
      alert("Utilisateur non trouvé. Veuillez réessayer.");
      return;
    }
    const payload = {
      roomName: props.roomName,
      userId: userId,
    }
    props.socket.emit("unbanUser", payload);
    setInput("");
    setShowSetting(false);
  }
  const handleMute = () => {
    let userId = findInDatabase(input);
    if (userId == 0) {
      alert("Utilisateur non trouvé. Veuillez réessayer.");
      return;
    }
    const payload = {
      roomName: props.roomName,
      userId: userId,
      timeout: 60,
    }
    props.socket.emit("muteUser", payload);
    setInput("");
    setShowSetting(false);
  }

  const handleKick = () => {
    let userId = findInDatabase(input);
    if (userId == 0) {
      alert("Utilisateur non trouvé. Veuillez réessayer.");
      return;
    }
    const payload = {
      roomName: props.roomName,
      userId: userId,
    }
    console.log(payload);
    props.socket.emit("kickUser", payload);
    setInput("");
    setShowSetting(false);
  }

  const handleInvited = useCallback((payload) => {
    setMessage(payload.message);
    setRoomNameInvite(payload.roomName);
    setShowConfirm(true);
  }, [])

  const handleNotInvite = useCallback((payload) => {
    alert(payload.message);
  }, [])

  const handleAdminList = useCallback((payload) => {
    setAdminList(payload.memberList.admins);
  }, [props.UserId, adminList])

  const handleCheckIfAdmin = useCallback((payload) => {
    console.log("handleCheckIfAdmin", payload)
    if (payload.roomName !== props.roomName) {
      console.log("update not this room!");
      return;
    }
    setAdminList(payload.memberList.admins);
  }, [props.UserId, props.roomName, ifAdmin, adminList])

  const handleMessagAction = useCallback((payload)=>{
    alert(payload.message);
    setInput("")
  },[])

  useEffect(()=>{
    if (!database){
      console.log("databse does not exist!")
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
                    <div className="RoomCreate-screen-card">
                        <div className="RoomCreate-screen-card-overlay"></div>
                        <div className="RoomCreate-screen-card-content">
						                <div className="RoomCreate-screen-card-content-body">
                                <div className='Profile-screen-card-title'>Modération</div>
                                    <div className="RoomDetail-screen-card-input-wrapper">
                                        <input placeholder="Nom" className='RoomDetail-screen-card-input' required value={input} onChange={(e) => setInput(e.target.value)} ></input>
                                        <div className="dropdown" id="drop-down">
                                            <label>
                                                <select
                                                    name="data"
                                                    className="RoomCreate-screen-card-select"
                                                    value={moderation.data}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="Muet" className='RoomCreate-screen-card-option'>Muet</option>
                                                    <option value="Sortir" className='RoomCreate-screen-card-option'>Sortir</option>
                                                    <option value="Bannir" className='RoomCreate-screen-card-option'>Bannir</option>
                                                    <option value="Débannir" className='RoomCreate-screen-card-option'>Débannir</option>
                                                </select>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="RoomCreate-button-wrapper">
                                        <button onClick={() => setShowSetting(false)} className="Settings-button">
                                            Annuler
                                        </button>
                                        <button className='Settings-button' onClick={handleModeration}>
                                            {moderation.data}
                                        </button>
                                  </div>
                                </div>
                            </div>
                        </div>
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
              <div className="chatinfo" ></div>
          )
      )

  );
}

