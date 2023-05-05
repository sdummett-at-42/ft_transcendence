import React, { useContext, useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Cookies from "js-cookie";
import "./Game.css"
import Canvas from "./Canvas/Canvas";
import Result from "./Result/Result";
import { UserContext } from "../../../context/UserContext"
import { Shape, Player } from "../../../../../backend/src/modules/game/entities/game.entities"
import { useNavigate } from "react-router-dom";
import Invitation from "../../Invitation/Invitation";

export default function Game() {
    const navigate = useNavigate();
    const id = window.location.pathname.split('/')[2];
    // const room = "game" + id;

    const { setLastUpdate } = useContext(UserContext);
    const [boolSocket, setBoolSocket] = useState(false);

    const [player1, setPlayer1] = useState<Player>(0);
    const [player2, setPlayer2] = useState<Player>(0);
    const [timer, setTimer] = useState<number>(0);
    const [elements, setElements] = useState<Shape[]>([]);
    const [boolVictory, setBoolVictory] = useState(false);
    const [victory, setVictory] = useState<[boolean, Player, Player, boolean]>([false, null, null, false]);

    const gameSocketTemp = useRef({});

    // TODO
    // si id change tout remettre comme au debut ou recharger la map
    // deconnecter socket

    if (!boolSocket) {
        gameSocketTemp.current = io(`${import.meta.env.VITE_BACKENDURL}/game`, {
			auth: {
				token: Cookies.get("connect.sid"),
				url: window.location.href,
			},
		});

        // peut etre emit join ici si pas fait
        gameSocketTemp.current.emit("joinGame", id);

        setBoolSocket(true);
    }

    /* ****************** *\
    |* Handle Input Event *|
    \* ****************** */

    const handleImage = (data : Shape[]) => {
        setElements(data);
    }

    const handleScore = (data) => {
        if (data.side === 1)
            setPlayer1(data);
        else 
            setPlayer2(data);
    }

    const handleVictory = (data : {type : Boolean, winner : Player, loser : Player, boolRanked : Boolean} ) => {
        // data= {Bollean, p1, p2}
        // false = score  true = abandon
        setVictory([data.type , data.winner, data.loser, data.boolRanked]);
        setBoolVictory(true);
        setLastUpdate(Date.now());
    }

    const handleTimer = (data) => {
        setTimer(data);
    }

    // Handle the socket events
    useEffect(() => {

        gameSocketTemp.current.on('image', handleImage);
        gameSocketTemp.current.on('score', handleScore);
        gameSocketTemp.current.on('victory', handleVictory);
        gameSocketTemp.current.on('gameTimer', handleTimer);

        return () => {
            gameSocketTemp.current.off('image', handleImage);
            gameSocketTemp.current.off('score', handleScore);
            gameSocketTemp.current.off('victory', handleVictory);
            gameSocketTemp.current.off('gameTimer', handleTimer);
        };
    }, [
        handleImage,
        handleScore,
        handleVictory,
        handleTimer,
        gameSocketTemp
    ]);

    useEffect(() => {
        const handleUnload = () => {
            setBoolSocket(false);
            gameSocketTemp.current.disconnect();
        };
      
        window.addEventListener("beforeunload", handleUnload);
      
        return () => {
            window.removeEventListener("beforeunload", handleUnload);
            gameSocketTemp.current.disconnect();
        };
      }, [gameSocketTemp]);

    const [allUsers, setAllUsers] = useState([]);

    // Fetch all users
    useEffect(() => {
        async function GetAllUsers() {
            const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/users`, {
                method: "GET",
                credentials: "include",
            });
			if (response.status === 401) {
				window.location.href = "/";
				return null;
			}
			const data = await response.json();
            setAllUsers(data);
        }

        GetAllUsers();
    },[]);

    // const [p1, setP1] = useState();
    // const [p2, setP2] = useState();

    // useEffect(() => {
    //     setP1(allUsers.filter((user) => user.id === player1?.id));
    //     setP2(allUsers.filter((user) => user.id === player2?.id));

    // }, [allUsers]);
    
    if (boolVictory) {
        return (
            <div>
                <Result data={[victory[0], victory[1], victory[2], victory[3]]}/>
                <Invitation />
            </div>
        )
    }

    return (
        <div className="game-container">
            <div className="Game-info Profile-screen-card-text">
                <p>Time = {(timer/1000).toFixed(3)}</p>
                <div className="Game-player-info">
                    <div className="Game-Player1">
                        {/* <img scr={p1?.profilePicture} alt="p1" className="ChatRoom-image" /> */}
                        {player1?.name} = {player1?.score}
                    </div>
                    <div className="Game-Player2">
                        {/* <img scr={p2?.profilePicture} alt="p2" className="ChatRoom-image" /> */}
                        {player2?.name} = {player2?.score}
                    </div>
                </div>
                <Canvas elements={elements} idGame={id} socketRef={gameSocketTemp} victory={victory}/>
            </div>
            <Invitation />
        </div>
    )
}