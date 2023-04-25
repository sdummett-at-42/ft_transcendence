import React, { useState } from 'react';
import { Player } from "../../../../../../backend/src/modules/game/entities/game.entities"
import "./Result.css" 

interface ResultProps {
    data: [Player, Player];
  };
  
const Result = ({data} : ResultProps) => {
    console.log("RESULT= ", data);

    const winner : Player = data[0];
    const loser : Player = data[1];


    return (
    <div>
        <div className="screenGlobal">
            <div class="heading">
                <h2>Fin de la partie ! Le gagant est {winner.name}</h2>
            </div>
            
            <div class="winner-loser-info">
                <div class="winner-info">
                   <h3>Gagnant</h3>
                   <p>{JSON.stringify(data[0])}</p>
                   <p>{winner.name}</p>
                   <p>{winner.elo}</p>
                   <p>{winner.eloChange}</p>
                </div>
                <div class="loser-info">
                   <h3>Perdant</h3>
                    <p>{JSON.stringify(data[1])}</p>
                </div>
            </div>
        </div>
    </div>
    );
};

export default Result;

                // <div className="screen">  
                //     <div className="screen-overlay"></div>  
                //     <div className="screen-content">
                //         <h2>Je met le contenu</h2>
                //     </div>
                // </div>