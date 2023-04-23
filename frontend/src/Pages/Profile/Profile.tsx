import React, { useState, useEffect, useRef } from "react";
import "./Profile.css";
import InitAchievements from "../Achievements/Achievements";


export default function Profile({ user }) {
	const [matchData, setMatchData] = useState(null);

	useEffect(() => {
		// Fetch match data
		fetch(`http://localhost:3001/users/${user.id}/matchs`, {
			method: "GET",
			credentials: "include",
		})
			.then((response) => response.json())
			.then((data) => setMatchData(data))
			.catch((error) => console.error(error));
	}, [user]);

	if (!user || !matchData) {
		return <p>Loading...</p>;
	}

	return <MatchList user={user} match={matchData} />;
}

// import { useState, useEffect } from "react";

function MatchList({ user, match }) {
	const { name, profilePicture, elo } = user;
	const { matchWon, matchLost } = match;

	const [allMatches, setAllMatches] = useState([]);
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nameRef = useRef<HTMLHeadingElement>(null);

    let interval = null;

    const onMouseOver = (event: React.MouseEvent<HTMLHeadingElement>) => {  
        let iteration = 0;

        clearInterval(interval);

        interval = setInterval(() => {
            if (!nameRef.current) return;
            nameRef.current.innerText = nameRef.current.dataset.value
                .split("")
                .map((letter, index) => {
                    if(index < iteration) {
                        return nameRef.current?.dataset.value[index];
                    }
                    return letters[Math.floor(Math.random() * 26)]
                })
                .join("");

            if(iteration >= nameRef.current.dataset.value.length){ 
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);
    }

	useEffect(() => {
		const blob = document.getElementById("blob");
		
		window.onpointermove = (event: PointerEvent) => {
			const { clientX, clientY } = event;
			blob?.animate({
				left: `${clientX}px`,
				top: `${clientY}px`,
			}, { duration: 3000, fill: "forwards" });
		};
	}, []);

	useEffect(() => {
		const fetchMatches = async () => {
			// Combine the matchWon and matchLost arrays into a single array
			const allMatches = [...matchWon, ...matchLost];

			// Sort the matches based on createdAt
			allMatches.sort(
				(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
			);

			// Fetch user data for each winner and loser
			const matchData = await Promise.all(
				allMatches.map(async (match) => {
					const winnerRes = await fetch(
						`http://localhost:3001/users/${match.winnerId}`,
						{
							method: "GET",
							credentials: "include",
						}
					);
					const winnerData = await winnerRes.json();

					const loserRes = await fetch(
						`http://localhost:3001/users/${match.looserId}`,
						{
							method: "GET",
							credentials: "include",
						}
					);
					const loserData = await loserRes.json();

					return {
						...match,
						winnerName: winnerData.name,
						loserName: loserData.name,
					};
				})
			);

			setAllMatches(matchData);
		};

		fetchMatches();
	}, [matchWon, matchLost]);

	return (
		<div>
			<div id="blob"></div>
			<div id="blur"></div>
			<div className="Profile">

				<div className="Profile-header">

					<div className="Profile-screen-card">
						<div className="Profile-screen-card-overlay"></div>  
                    	<div className="Profile-screen-card-content">
							<div className="Profile-screen-card-content-header">
								<img
									src={profilePicture}
									alt={`Photo de profil de ${name}`}
									className="profile-picture"
								/>
                        		<div className="Profile-screen-card-user">
                            		<span className="Profile-screen-card-name" data-value={name} onMouseOver={onMouseOver} ref={nameRef}>{name}</span>
									<p className="Profile-screen-card-elo">Elo :{elo}</p>
                        		</div>
							</div>
						</div>
					</div>

								<p className="link">
									Wins/Losses: {matchWon.length}/{matchLost.length}
								</p>
				<InitAchievements userId={user.id} showLocked={false} />
				</div>


				
				<h3>Matches</h3>
				{allMatches.length === 0 ? (
					<p>No matches played.</p>
				) : (
					<table className="match-table">
						<thead>
							<tr>
								<th>Winner</th>
								<th>Loser</th>
								<th>Winner Score</th>
								<th>Loser Score</th>
							</tr>
						</thead>
						<tbody>
							{allMatches.map((match) => (
								<tr key={`match-${match.id}`}>
									<td>{match.winnerName}</td>
									<td>{match.loserName}</td>
									<td>{match.winnerScore}</td>
									<td>{match.looserScore}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}