import React, { useState, useEffect, useRef } from "react";
import "./Profile.css";
import InitAchievements from "../Achievements/Achievements";
import Popup from "../Popup/Popup";


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
	const { name, profilePicture, elo, id } = user;
	const { matchWon, matchLost } = match;
	
	const [allMatches, setAllMatches] = useState([]);
	const [allUsers, setAllUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [isOpen, setIsOpen] = useState(false);
    const nameRef = useRef<HTMLHeadingElement>(null);
	const succesRef = useRef<HTMLHeadingElement>(null);
	const matchRef = useRef<HTMLHeadingElement>(null);
	const historyRef = useRef<HTMLHeadingElement>(null);
	const circle1Ref = useRef<SVGCircleElement>(null);
	const circle2Ref = useRef<SVGCircleElement>(null);
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let nameinterval = null;
	let succesinterval = null;
	let matchinterval = null;
	let historyinterval = null;

    const NameCascade = (event: React.MouseEvent<HTMLHeadingElement>) => {  
        let iteration = 0;

        clearInterval(nameinterval);

        nameinterval = setInterval(() => {
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
                clearInterval(nameinterval);
            }

            iteration += 1 / 6;
        }, 30);
    }

	const SuccesCascade = (event: React.MouseEvent<HTMLHeadingElement>) => {  
        let iteration = 0;

        clearInterval(succesinterval);

        succesinterval = setInterval(() => {
            if (!succesRef.current) return;
            succesRef.current.innerText = succesRef.current.dataset.value
                .split("")
                .map((letter, index) => {
                    if(index < iteration) {
                        return succesRef.current?.dataset.value[index];
                    }
                    return letters[Math.floor(Math.random() * 26)]
                })
                .join("");

            if(iteration >= succesRef.current.dataset.value.length){ 
                clearInterval(succesinterval);
            }

            iteration += 1 / 6;
        }, 30);
    }

	const MatchCascade = (event: React.MouseEvent<HTMLHeadingElement>) => {  
        let iteration = 0;

        clearInterval(matchinterval);

        matchinterval = setInterval(() => {
            if (!matchRef.current) return;
            matchRef.current.innerText = matchRef.current.dataset.value
                .split("")
                .map((letter, index) => {
                    if(index < iteration) {
                        return matchRef.current?.dataset.value[index];
                    }
                    return letters[Math.floor(Math.random() * 26)]
                })
                .join("");

            if(iteration >= matchRef.current.dataset.value.length){ 
                clearInterval(matchinterval);
            }

            iteration += 1 / 6;
        }, 30);
    }

	const HistoryCascade = (event: React.MouseEvent<HTMLHeadingElement>) => {  
        let iteration = 0;

        clearInterval(historyinterval);

        historyinterval = setInterval(() => {
            if (!historyRef.current) return;
            historyRef.current.innerText = historyRef.current.dataset.value
                .split("")
                .map((letter, index) => {
                    if(index < iteration) {
                        return historyRef.current?.dataset.value[index];
                    }
                    return letters[Math.floor(Math.random() * 26)]
                })
                .join("");

            if(iteration >= historyRef.current.dataset.value.length){ 
                clearInterval(historyinterval);
            }

            iteration += 1 / 6;
        }, 30);
    }

	// const circle = document.getElementById("circle") as HTMLElement;
	// const fillPercentage = 75; // Example value, you can replace this with your own value

	// circle.setAttribute("data-fill", fillPercentage.toString());

	
	const Result = () => {
		let res = 0;
		if (matchWon.length + matchLost.length > 0) {
			res = Math.floor((matchWon.length / (matchWon.length + matchLost.length)) * 100);
		}
		return res;
	}

	useEffect(() => {
		if (circle2Ref.current) {
		  const percent = Result();
		  const offset = 320 - (320 * percent) / 100;
		  circle2Ref.current.style.strokeDashoffset = offset.toString();
		}
	}, []);

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

	useEffect(() => {
		const fetchUsers = async () => {
			const res = await fetch("http://localhost:3001/users", {
				method: "GET",
				credentials: "include",
			});
			const data = await res.json();
			setAllUsers(data);
		};
		fetchUsers();
	}, []);

	const Opponent = (match) => {
		const opponentId = match.winnerId === id ? match.looserId : match.winnerId;
		const opponent = allUsers.find((user) => user.id === opponentId);
		return opponent;
	}

	const handleUserClick = (user) => {
		setSelectedUser(user);
		setIsOpen(true);
	};

	const handleOpen = () => {
		setIsOpen(true);
	};

	const handleClose = () => {
		setIsOpen(false);
		setSelectedUser(null);
	};

	return (
		<div>
			<div id="blob"></div>
			<div id="blur"></div>
			<div className="Profile">

				<div className="Profile-header">

					<div className="Profile-screen-card">
						<div className="Profile-screen-card-overlay"></div>
                    	<div className="Profile-screen-card-content">
							<div className="Profile-screen-card-content-body">
								<img
									src={profilePicture}
									alt={`Photo de profil de ${name}`}
									className="Profile-picture"
									draggable="false"
								/>
                        		<div className="Profile-screen-card-user">
                            		<span className="Profile-screen-card-title" data-value={name} onMouseOver={NameCascade} ref={nameRef}>{name}</span>
									<p className="Profile-screen-card-text">Elo :{elo}</p>
                        		</div>
							</div>
						</div>
					</div>

				</div>

				<div className="Profile-body">

					<div className="Profile-screen-achivement">
						<div className="Profile-screen-achivement-overlay"></div>
						<div className="Profile-screen-achivement-content">
							<div className="Profile-screen-achivement-content-body">
								<span className="Profile-screen-card-title" data-value="Succès" onMouseOver={SuccesCascade} ref={succesRef}>Succès</span>
								<div className="Profile-achivement-progress-bar">
									<div className="Profile-achivement-progress" style={{width: "0%"}}></div>
								</div>
								<div className="Profile-screen-achivement-user">
									<InitAchievements userId={user.id} showLocked={true} />
								</div>
							</div>
						</div>
					</div>

					<div className="Profile-screen-match">
						<div className="Profile-screen-match-overlay"></div>
						<div className="Profile-screen-match-content">
							<div className="Profile-screen-match-content-body">
								<span className="Profile-screen-card-title" data-value="Partie" onMouseOver={MatchCascade} ref={matchRef}>Partie</span>
								<div className="Profile-match-progress">
    								<div className="Profile-match-progress-bar">
      									<svg className="Profile-match-svg">
        									<circle cx="50" cy="50" r="50" ref={circle1Ref}></circle>
        									<circle cx="50" cy="50" r="50" ref={circle2Ref}></circle>
      									</svg>
      									<div className="Profile-match-progress-number">
       										<h2>{Result()}<span>%</span></h2>
      									</div>
    								</div>
  								</div>
						
								<p className="Profile-screen-card-text">
									{matchWon.length} V / {matchLost.length} D
								</p>
						
								<span className="Profile-screen-card-title" data-value="Historique" onMouseOver={HistoryCascade} ref={historyRef}>Historique</span>

								<div className="Profile-match-container Profile-screen-card-text">
									{allMatches.length === 0 ? (
										<p className="Profile-screen-card-text">Aucun match</p>
									) : (
										<table className="Profile-match-table">
											<tbody>
												{allMatches.map((match) => (
													<tr
														key={`match-${match.id}`}
														className={`Profile-match-table-tr ${(match.winnerId === id) ? "Profile-match-table-win" : "Profile-match-table-losse"}`}
														onClick={() => handleUserClick(Opponent(match))}
													>
														<td >
															<div className="Profile-match-td">
																<img src={Opponent(match).profilePicture} alt="Photo de profil de l'adversaire" className="Profile-match-picture" />
																<p>{Opponent(match).name}</p>
															</div>
														</td>
														<td>{match.winnerScore} / {match.looserScore} </td>
													</tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							</div>
						</div>
					</div>
					{selectedUser && (
						<Popup isOpen={isOpen}>
							<div className="Profile-screen-card-popup">
								<div className="Profile-screen-card-overlay"></div>
                    			<div className="Profile-screen-card-content">
									<div className="Profile-screen-card-popup-content">
										<img
											src={selectedUser.profilePicture}
											alt={`Photo de profil de ${selectedUser.name}`}
											className="profile-picture"
											draggable="false"
										/>
                        				<div className="Profile-screen-card-user">
                            				<span className="Profile-screen-card-title" data-value={selectedUser.name} onMouseOver={NameCascade} ref={nameRef}>{selectedUser.name}</span>
											<p className="Profile-screen-card-text">Elo :{selectedUser.elo}</p>
                        				</div>
									</div>
								</div>
							</div>
							<button className="close-button" onClick={handleClose} >
								X
							</button>
						</Popup>
					)}
				</div>
			</div>
		</div>
	);
}

function UserPopup({ user, onClose }) {
	const handleOutsideClick = (e) => {
		if (e.target.classList.contains("popup")) {
			onClose();
		}
	};

	return (
		<div className="popup" onClick={handleOutsideClick}>
			<div className="popup-content">
				<button className="close-button" onClick={onClose}>
					X
				</button>
				<Profile user={user} />
			</div>
		</div>
	);
}
