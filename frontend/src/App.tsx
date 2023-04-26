import React, { useContext, useEffect} from "react";
import { Routes, Route } from "react-router-dom";
import LoginSelector from "./Pages/Login/LoginSelector";
import CreateAccount from "./Pages/Login/CreateAccount/CreateAccount";
import Home from "./Pages/Home/Home";
import Profile from "./Pages/Profile/Profile";
import NotFound from "./Pages/Errors/NotFound/NotFound";
import Layout from "./Pages/Navbar/Layout";
import Unauthorized from "./Pages/Errors/Unauthorized/Unauthorized";
import Lobby from "./Pages/Game/Lobby/Lobby";
import Game from "./Pages/Game/Pong/Game";
import InitAchievements from "./Pages/Achievements/Achievements";
import InitStats from "./Pages//Stats/Stats";
import Settings from "./Pages/Settings/Settings";
import ChatLogin from "./Pages/Chat/ChatLogin";
import TwoFactor from "./Pages/Login/TwoFactor/TwoFactor";
import Loading from "./Pages/Loading/Loading";
import { UserContext } from "./context/UserContext";
import { useNavigate } from "react-router-dom";

function App() {
	const { user } = useContext(UserContext);
	const { gameSocketRef } = useContext(UserContext);
	const navigate = useNavigate();

	const handleGetInvitationGame = (data : {player : number, you : number, type : string}) => {
		console.log('handleGetInvitationGame');
		const senderId : number = data.player;
		const typeGame : string = data.type; // "ranked" | "custom"
		const yourId : number = data.you;
		const res : Boolean = false;
		// refuse :
		// if ()
		  gameSocketRef.current.emit('reponseInvitationGame', {p1 : senderId, p2 : yourId, res : false});
	
		// accepte
		// if () 
		  gameSocketRef.current.emit('reponseInvitationGame', {p1 : senderId, p2 : yourId, res : false});
		
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
		<div className="App">
			<Routes>
				<Route path="/home" element={<Layout children={<Home />} />} />
				<Route
					path="/lobby"
					element={<Layout children={<Lobby />} />}
				/>
				{user ? (
					<Route
						path="/profile"
						element={<Layout children={<Profile user={user} />} />}
					/>
				) : null}
				<Route
					path="/settings"
					element={<Layout children={<Settings />} />}
				/>
				<Route path="/unauthorized" element={<Unauthorized />} />
				{user ? (
					<Route
						path="/achievements"
						element={
							<Layout
								children={
									<InitAchievements
										userId={user.id}
										showLocked={true}
									/>
								}
							/>
						}
					/>
				) : null}
				{user ? (
					<Route
						path="/stats"
						element={<Layout children={<InitStats user={user}/>} />}
					/>
				): null}
				<Route
					path="/chat/:userId?/:userName?"
					element={<Layout children={<ChatLogin user={user} />} />}
				/>
				<Route path="/" element={<LoginSelector />} />
				<Route path="/register" element={<CreateAccount />} />
				<Route path="/login/2fa" element={<TwoFactor />} />
				<Route path="/*" element={<Layout children={<NotFound />} />} />
				<Route path="/loading" element={<Loading />} />
				<Route
					path="/game/:id"
					element={<Layout children={<Game />} />}
				/>
			</Routes>
		</div>
	);
}

export default App;
