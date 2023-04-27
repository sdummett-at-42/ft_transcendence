import React, { useState, useEffect, useContext} from "react";
import { UserContext } from "./../../context/UserContext";
import { useNavigate } from "react-router-dom";
import Popup from "./../Popup/Popup";
import {Socket } from 'socket.io';


interface InvitaionProps{
 
}
export default function  Invitaion(props:  InvitaionProps) {

    const { user, gameSocketRef } = useContext(UserContext);
	const navigate = useNavigate();
    const [isDelOpen, setDelIsOpen] = useState(false);
	const [fromId, setFromId] = useState(0);
	const [typeGame, setTypeGame] = useState("");


	const handleGetInvitationGame = (data : {player : number, you : number, type : string}) => {
		console.log('handleGetInvitationGame', data);
        setDelIsOpen(true);
		setFromId(data.player);
		setTypeGame(data.type);
	
		// const senderId : number = data.player;
		// const typeGame : string = data.type; // "ranked" | "custom"
		// const yourId : number = data.you;
		// const res : Boolean = false;

		
	  }
	  
	  // after agree client go in game
	  const handlegoInGame = (data : string) => {
		console.log('handlegoInGame');
		navigate(`/game/${data}`);
	  }
	
	  // send to initial sender if target doesn't accept
	  const handleRefuseInvitationGame = (data : number) => {
		console.log('handleRefuseInvitationGame');
		const userId = data;
	
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
		    <div className="Profile-screen-card-popup">
				<div className="Profile-screen-card-overlay"></div>
            	<div className="Profile-screen-card-content">
					<div className="Profile-screen-card-popup-content">
            			<div> {user?.name} vous invite à jouer au Pong. Le rejoindre ?</div>
						<button onClick={handleAccept}>Accepter</button>
						<button onClick={handleRefuse}>Refuser</button>
					</div>
				</div>
			</div>
    </Popup>
  );
};


