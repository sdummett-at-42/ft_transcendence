import React, { useRef } from 'react';
import { Player } from "../../../../../../backend/src/modules/game/entities/game.entities"
import "./Result.css" 

interface ResultProps {
    data: [Boolean, Player, Player, Boolean];
  };
  
const Result = ({data} : ResultProps) => {

    const victory : string = data[0] === true ? "abandon" : "score";
    const winner : Player = data[1];
    const loser : Player = data[2];
	const ranked : Boolean = data[3];

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let winnerinterval = null;
    const winnerRef = useRef<HTMLHeadingElement>(null);
	let loserinterval = null;
	const loserRef = useRef<HTMLHeadingElement>(null);

    // Handle name animation
	const WinnerCascade = (event: React.MouseEvent<HTMLHeadingElement>) => {  
		let iteration = 0;
		
		clearInterval(winnerinterval);
				
		winnerinterval = setInterval(() => {
			if (!winnerRef.current) return;
			winnerRef.current.innerText = winnerRef.current.dataset.value
				.split("")
				.map((letter, index) => {
					if(index < iteration) {
						return winnerRef.current.dataset.value[index];
					}
					return letters[Math.floor(Math.random() * 26)]
				})
				.join("");
					
			if(iteration >= winnerRef.current.dataset.value?.length) { 
				clearInterval(winnerinterval);
			}
					
			iteration += 1 / 6;
		}, 30);
	};
	
	// Handle succes animation
	const LoserCascade = (event: React.MouseEvent<HTMLHeadingElement>) => {  
		let iteration = 0;
		
		clearInterval(loserinterval);
		
		loserinterval = setInterval(() => {
			if (!loserRef.current) return;
			loserRef.current.innerText = loserRef.current.dataset.value
				.split("")
				.map((letter, index) => {
					if(index < iteration) {
						return loserRef.current?.dataset.value[index];
					}
					return letters[Math.floor(Math.random() * 26)]
				})
				.join("");
		
			if(iteration >= loserRef.current.dataset.value.length) { 
				clearInterval(loserinterval);
			}
		
			iteration += 1 / 6;
		}, 30);
	};


    return (
        <div className="RoomCreate-screen-card">
            <div className="RoomCreate-screen-card-overlay"></div>
            <div className="RoomCreate-screen-card-content">
			    <div className="RoomCreate-screen-card-content-body">
                    <div className="heading">
                        <h2 className='Profile-screen-card-text'>Fin de la partie par {victory} ! Le gagnant est {winner.name} !</h2>
                        <h2 className='Profile-screen-card-title'>{winner.score} - {loser.score}</h2>
                    </div>
                    <div className="winner-loser-info Profile-screen-card-text">
							<div className="winner-info" onMouseOver={WinnerCascade}>
                            <h3 className='winner-title'>Gagnant</h3>
                            <p>{winner.name}</p>
							{ranked ? (
								<div>
									<p data-value={winner.elo + winner.eloChange} ref={winnerRef}>{winner.elo}</p>
									<p id="winner-elo">{winner.eloChange}</p>
								</div>
							) : (
								<div></div>
							)}
                        </div>

							<div className="loser-info" onMouseOver={LoserCascade}>
                            <h3 className='loser-title'>Perdant</h3>
                            <p>{loser.name}</p>
							{ranked ? (
								<div>
									<p data-value={loser.elo + loser.eloChange} ref={loserRef}>{loser.elo}</p>
									<p id="loser-elo">{loser.eloChange}</p>
								</div>
							) : (
								<div></div>
							)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result;