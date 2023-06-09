import React, { useState, useEffect, useContext} from "react";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import Popup from "../Popup/Popup";
import {Socket } from 'socket.io';


interface InvitationProps{
 
}
export default function  Invitation(props:  InvitationProps) {

    const { user, gameSocketRef } = useContext(UserContext);
	const navigate = useNavigate();
    const [isDelOpen, setDelIsOpen] = useState(false);
	const [fromId, setFromId] = useState(0);
	const [typeGame, setTypeGame] = useState("");
	const [nameTarget, setNameTarget] = useState("");


	  const handleGetInvitationGame = (data : {player : number, you : number, type : string, nameTarget : string}) => {
        setDelIsOpen(true);
        setFromId(data.player);
        setTypeGame(data.type);
		setNameTarget(data.nameTarget);
      }

		// gameSocketRef.current.emit('reponseInvitationGame', {client : fromSocket, res : true, type : typeGame});
	  
	  // after agree client go in game
	  const handlegoInGame = (data) => {
		navigate(`/game/${data}`);
	  }
	
	  // send to initial sender if target doesn't accept
	  const handleRefuseInvitationGame = (data) => {
		alert(data.state);
		// userId a refuser ou n'est pas disponible pour une game
	  }
	
    
	  // when client click en button to send invitation use:
	  // gameSocketRef.current.emit('sendInvitationGame', idTarget : number);
	
	
	  // Handle the socket events

      const handleDelClose = ()=>{
        setDelIsOpen(false)

      }
	  const handleAccept = () =>{
		gameSocketRef.current.emit('reponseInvitationGame', {client : fromId, res : true, type : typeGame});
		handleDelClose();


	  }
		const handleRefuse = () =>{
			gameSocketRef.current.emit('reponseInvitationGame', {client : fromId, res : false, type : typeGame});
			handleDelClose();
		} 
	  useEffect(() => {
	
		gameSocketRef.current.on('getInvitationGame', handleGetInvitationGame);
		gameSocketRef.current.on('goInGame', handlegoInGame);
		gameSocketRef.current.on('refuseInvitationGame', handleRefuseInvitationGame);
		return () => {
		  gameSocketRef.current.off('getInvitationGame', handleGetInvitationGame);
		  gameSocketRef.current.off('goInGame', handlegoInGame);
		  gameSocketRef.current.off('refuseInvitationGame', handleRefuseInvitationGame);
	
		};
	   }, [
		handleGetInvitationGame,
		handlegoInGame,
		handleRefuseInvitationGame,
		gameSocketRef
	  ]);
	

  return (
    <Popup isOpen={isDelOpen} isClose={handleDelClose}>
		        <div className="RoomCreate-screen-card">
        <div className="RoomCreate-screen-card-overlay"></div>
          <div className="RoomCreate-screen-card-content">
						  <div className="RoomCreate-screen-card-content-body">
						<div className="Invite-margin-top">

            			<div className="Profile-screen-card-text"> {nameTarget} vous invite à jouer au Pong. Le rejoindre ?</div>
						<div className="RoomCreate-button-wrapper">
							<button onClick={handleRefuse} className="Settings-button Settings-delete-account-button">Refuser</button>
							<button onClick={handleAccept} className="Settings-button Settings-upload-button">Accepter</button>
						</div>
						</div>
					</div>
				</div>
			</div>
    </Popup>
  );
};


