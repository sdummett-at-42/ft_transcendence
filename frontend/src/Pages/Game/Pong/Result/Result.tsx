import React, { useState } from 'react';
import { Player } from "../../../../../../backend/src/modules/game/entities/game.entities"
import "./Result.css" 

interface ResultProps {
    data: [Boolean, Player, Player];
  };
  
const Result = ({data} : ResultProps) => {
    console.log("RESULT= ", data);

    const victory : string = data[0] === true ? "abandon" : "score";
    const winner : Player = data[1];
    const loser : Player = data[2];



    return (
    <div>
        <div className="screenGlobal">
            <div class="heading">
                <h2>Fin de la partie par {victory} ! Le gagnant est {winner.name} !</h2>
                <h2>{winner.score} - {loser.score}</h2>

            </div>
            
            <div class="winner-loser-info">
                <div class="winner-info">
                   <h3>Gagnant</h3>
                   {/* <p>{JSON.stringify(winner)}</p> */}
                   <p>{winner.name}</p>
                   <p>{winner.elo}</p>
                   <p>{winner.eloChange}</p>
                </div>
                <div class="loser-info">
                   <h3>Perdant</h3>
                    {/* <p>{JSON.stringify(loser)}</p> */}
                    <p>{loser.name}</p>
                    <p>{loser.elo}</p>
                    <p>{loser.eloChange}</p>
                    
                </div>
            </div>
        </div>
    </div>
    );
};

export default Result;