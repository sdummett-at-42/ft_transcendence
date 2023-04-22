import React, { useContext, useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Cookies from "js-cookie";
import "./Game.css"
import Canvas from "./Canvas";
import { UserContext } from "../../../context/UserContext"
import { Shape } from "../../../../../backend/src/modules/game/entities/game.entities"

export default function Game() {
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
        gameSocketTemp.current = io("/game/:id", {
			auth: {
				token: Cookies.get("connect.sid"),
				url: window.location.href,
			},
		});
        console.log(`Socket connect to /game/${id}`);
        // peut etre emit join ici si pas fait
    }

    /* ****************** *\
    |* Handle Input Event *|
    \* ****************** */

    const handleImage = (data : Shape[]) => {
        console.log("image:", data);
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