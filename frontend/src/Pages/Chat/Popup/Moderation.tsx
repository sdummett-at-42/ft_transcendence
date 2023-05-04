import React, { useState, useContext, useEffect, useCallback } from "react";
import "./Popup.css";
import { Socket } from "socket.io-client";
import { DatabaseContext } from "../ChatLogin";

interface ModerationProps {
    socket: Socket,
    isVisible: Boolean,
    onClose: () => void,
    roomName: string,
    onUpdate: () => void;
}

export default function Moderation(props: ModerationProps) {
    const [showSetting, setShowSetting] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const database = useContext(DatabaseContext);
    const [input, setInput] = useState("");
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
                    return user;
                }
                else {
            
                    setErrorMessage("Utilisateur non trouvé. Veuillez réessayer.1");
                    clearInterval(interval);
                    return;
                }
            }, 1000);
        } else {
            return user;
        }
      };

      const handleEnter = (event) => {
        if (event.key === 'Enter') {
            setErrorMessage("");
            setSuccessMessage("");
            event.preventDefault();
            handleModeration();
        }
    };

    const handleEscape = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            props.onClose();
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setModeration({
            ...moderation,
            [name]: value
        });
    };
    
    const handleModeration = () => {
        setErrorMessage("");
        setSuccessMessage("");
        if (!input) {
            setErrorMessage("Veuillez entrer un nom d'utilisateur.2");
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
        setErrorMessage("");
        let user = findInDatabase(input);
        if (user === undefined || user.id === 0) {
            setErrorMessage("Utilisateur non trouvé. Veuillez réessayer.3");
            return;
        } else {
            const payload = {
                roomName: props.roomName,
                userId: user.id,
            }
            props.socket.emit("banUser", payload);
            // setSuccessMessage(`${user.name} banni avec succès.`);
            setErrorMessage("");
            setInput("");
        }
    }

    const handleUnBan = () => {
        setErrorMessage("");
        const user = findInDatabase(input);
        if (user === undefined || user.id === 0) {
            setErrorMessage("Utilisateur non trouvé. Veuillez réessayer.4");
            return;
        } else {
            const payload = {
                roomName: props.roomName,
                userId: user.id,
            }
            props.socket.emit("unbanUser", payload);
            // setSuccessMessage(`${user.name} débanni avec succès.`);
            setErrorMessage("");
            setInput("");
        }
    }
    
    const handleMute = () => {
        setErrorMessage("");
        const user = findInDatabase(input);

        if ( user === undefined || user.id === 0) {
            setErrorMessage("Utilisateur non trouvé. Veuillez réessayer.5");
            return;
        } else {
            const payload = {
                roomName: props.roomName,
                userId: user.id,
                timeout: 60,
            }
            props.socket.emit("muteUser", payload);
            // setSuccessMessage(`${user.name} muté avec succès.`);
            setErrorMessage("");
            setInput("");
        }
    }
    
    const handleKick = () => {
        setErrorMessage("");
        let user = findInDatabase(input);
        if (user === undefined || user.id === 0) {
            setErrorMessage("Utilisateur non trouvé. Veuillez réessayer.6");
            return;
        } else {
            const payload = {
                roomName: props.roomName,
                userId: user.id,
            }
            props.socket.emit("kickUser", payload);
            // setSuccessMessage(`${user.name} sorti avec succès.`);
            setErrorMessage("");
            setInput("");
        }
    }
    const handleMessagAction = useCallback((payload)=>{
        setErrorMessage("");
        setSuccessMessage(payload.message);
    },[successMessage, errorMessage])

    useEffect(() => {
        if(props.socket){
          props.socket.on("userBanned", handleMessagAction);
          props.socket.on("unbanned", handleMessagAction);
          props.socket.on("userMuted", handleMessagAction);
          props.socket.on("userKicked", handleMessagAction);
        }
        return () => {
          if(props.socket){
            props.socket.off("userBanned", handleMessagAction);;
            props.socket.off("unbanned", handleMessagAction);
            props.socket.off("userMuted", handleMessagAction);
            props.socket.off("userKicked", handleMessagAction);
          }
        };
      }, [props.socket,handleMessagAction, successMessage, errorMessage]);

    return (
        <div className="RoomCreate-screen-card" onKeyDown={handleEscape}>
            <div className="RoomCreate-screen-card-overlay"></div>
            <div className="RoomCreate-screen-card-content">
                <div className="RoomCreate-screen-card-content-body">
                    <div className='Profile-screen-card-title'>Modération</div>
                    <div className="RoomDetail-screen-card-input-wrapper">
                        <input placeholder="Nom" className='RoomDetail-screen-card-input' onKeyDown={handleEnter} autoFocus={true} required value={input} onChange={(e) => setInput(e.target.value)} ></input>
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
                    {errorMessage && <div className="Settings-error">{errorMessage}</div>}
                    {successMessage && <div className="RoomCreate-success">{successMessage}</div>}
                    <div className="RoomCreate-button-wrapper">
                        <button onClick={() => setShowSetting(false)} className="Settings-button">
                            Annuler
                        </button>
                        <button className='Settings-button Settings-upload-button' onClick={handleModeration}>
                            {moderation.data}
                        </button>
                  </div>
                </div>
            </div>
        </div>
    );
}