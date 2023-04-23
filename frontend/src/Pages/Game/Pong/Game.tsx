import React, { useContext, useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Cookies from "js-cookie";
import "./Game.css"
import Canvas from "./Canvas";
import { UserContext } from "../../../context/UserContext"
import { Shape } from "../../../../../backend/src/modules/game/entities/game.entities"
import { useNavigate } from "react-router-dom";

export default function Game() {
    //const navigate = useNavigate();
    const id = window.location.pathname.split('/')[2];
    // const room = "game" + id;

    const { user, gameSocketRef } = useContext(UserContext);
    const [boolSocket, setBoolSocket] = useState(false); 

    const [scoreP1, setScoreP1] = useState<number>(0);
    const [scoreP2, setScoreP2] = useState<number>(0);
    const [timer, setTimer] = useState<number>(0);
    const [elements, setElements] = useState<Shape[]>([]);

    const gameSocketTemp = useRef({});
    if (!boolSocket) {
        gameSocketTemp.current = io("http://localhost:3001/game", {
			auth: {
				token: Cookies.get("connect.sid"),
				url: window.location.href,
			},
		});
        console.log(io);

        
        console.log(`Socket connect to /game`);
        // peut etre emit join ici si pas fait
        gameSocketTemp.current.emit("joinGame", id)
        console.log(`Join /game/${id}`);

        setBoolSocket(true);
    }

    /* ****************** *\
    |* Handle Input Event *|
    \* ****************** */

    const handleImage = (data : Shape[]) => {
        //console.log("image:", data);
        setElements(data);
    }

    const handleScore = (data) => {
        if (data.side === 1)
            setScoreP1(data.score);
        else 
            setScoreP2(data.score);
    }

    const handleVictoryScore = (data) => {
        // TODO
        // victoryScore
    }

    const handleVictoryAbandon = (data) => {
        // TODO
        // victory abandon
    }

    const handleTimer = (data) => {
        setTimer(data);
    }

    // const handleConnectGame = () => {
    //     const msg = "User have join the game Y has player X.";
    //     gameSocketRef.current.emit("joinGame", {roomId : room, message : msg});
    // }

    // Handle the socket events
    useEffect(() => {

        gameSocketTemp.current.on('image', handleImage);
        gameSocketTemp.current.on('score', handleScore);
        gameSocketTemp.current.on('VictoryScore', handleVictoryScore);
        gameSocketTemp.current.on('VictoryScore', handleVictoryAbandon);
        gameSocketTemp.current.on('gameTimer', handleTimer);
        // gameSocketTemp.current.on('connect', handleConnectGame);

        return () => {
            gameSocketTemp.current.off('image', handleImage);
            gameSocketTemp.current.off('score', handleScore);
            gameSocketTemp.current.off('VictoryScore', handleVictoryScore);
            gameSocketTemp.current.off('VictoryScore', handleVictoryAbandon);
            gameSocketTemp.current.off('gameTimer', handleTimer);
            // gameSocketTemp.current.on('connect', handleConnectGame);
        };
    }, [
        handleImage,
        handleVictoryScore,
        handleVictoryAbandon,
        handleTimer,
        // handleConnectGame,
        gameSocketTemp
    ]);

    useEffect(() => {
        const handleUnload = () => {
          gameSocketTemp.current.disconnect();
        };
      
        window.addEventListener("beforeunload", handleUnload);
      
        return () => {
          window.removeEventListener("beforeunload", handleUnload);
          gameSocketTemp.current.disconnect();
        };
      }, [gameSocketTemp]);


    //   fetch(`http://localhost:3001/game/${id}`, {
    //     credentials: "include",
    //     method: "GET",
    //     })
    //     .then(response => {
    //     if (response.status === 404) {
    //       // la page n'a pas été trouvée, afficher un message d'erreur ou rediriger vers une autre page
    //       console.log("Page not found");
    //       navigate("/*")
    //     } else if (response.status === 200) {
    //       // la page a été trouvée, afficher la page
    //       console.log("Page found");
    //     }
    //   })
    //   .catch(error => {
    //     // une erreur s'est produite, afficher un message d'erreur ou rediriger vers une autre page
    //     console.log("Error:", error);
    //   });

    return (
        <div>
            <h1>Game</h1>
            <div id="timer">Time = {timer}</div>
            <div id="Scorep1">Player 1 = {scoreP1}</div>
            <div id="Scorep2">Player 2 = {scoreP2}</div>
            <Canvas elements={elements} idGame={id} socketRef={gameSocketTemp}/>
        </div>
    )
}