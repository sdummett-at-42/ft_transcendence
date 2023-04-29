import React, { useState, useEffect, useRef } from "react";
import "./Profile.css";
import InitAchievements from "../Achievements/Achievements";
import Popup from "../Popup/Popup";
import SpecProfile from "./SpecProfile/SpecProfile";
import Invitaion from "../Invitaion/Invitaion";
export default function Profile({ user }) {
	const [matchData, setMatchData] = useState(null);
	
	useEffect(() => {
		// Fetch match data
		fetch(`${import.meta.env.VITE_BACKENDURL}/users/${user.id}/matchs`, {
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
	
	return <DisplayProfile user={user} match={matchData} />;
}

function DisplayProfile({ user, match }) {
	const { name, profilePicture, elo, id } = user;
	const { matchWon, matchLost } = match;
	
	// Handle machs, achievements and users data
	const [allMatches, setAllMatches] = useState([]);
	const [achievements, setAchievements] = useState([]);
	const [allUsers, setAllUsers] = useState([]);
	
	// Handle locked achievements
	const [showLocked, setShowLocked] = useState(false);
	
	// Handle popup
	const [selectedUser, setSelectedUser] = useState(null);
	const [isOpen, setIsOpen] = useState(false);

	// Handle text animation
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let nameinterval = null;
    const nameRef = useRef<HTMLHeadingElement>(null);
	let succesinterval = null;
	const succesRef = useRef<HTMLHeadingElement>(null);
	let matchinterval = null;
	const matchRef = useRef<HTMLHeadingElement>(null);
	let historyinterval = null;
	const historyRef = useRef<HTMLHeadingElement>(null);
	
	// Handle progress animation
	const succes1Ref = useRef<SVGCircleElement>(null);
	const succes2Ref = useRef<SVGCircleElement>(null);
	const match1Ref = useRef<SVGCircleElement>(null);
	const match2Ref = useRef<SVGCircleElement>(null);

	// Fetch all achievements
	useEffect(() => {
		async function fetchAchievements(userId: number) {
			const [userAchievementsRes, allAchievementsRes] = await Promise.all([
				fetch(`${import.meta.env.VITE_BACKENDURL}/users/${userId}/achievements`, {
					method: "GET",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
				}),
				fetch(`${import.meta.env.VITE_BACKENDURL}/achievements`, {
					method: "GET",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
				}),
			]);
			if (userAchievementsRes.status === 200 && allAchievementsRes.status === 200) {
				const userAchievementsJson = await userAchievementsRes.json();
				const allAchievementsJson = await allAchievementsRes.json();
				const userAchievementIds = userAchievementsJson.achievements.map((achievement) => achievement.id);
				const achievements = allAchievementsJson.map((achievement) => {
					const isUnlocked = userAchievementIds.includes(achievement.id);
					return { ...achievement, unlocked: isUnlocked };
				});
				setAchievements(achievements);
			}
		};
		fetchAchievements(user.id);
	}, [user.id]);

	// Merge matchWon and matchLost into a single array
	useEffect(() => {
		const fetchMatches = async () => {
			// Combine the matchWon and matchLost arrays into a single array
			const allMatches = [...matchWon, ...matchLost];
			
			// Sort the matches based on createdAt
			allMatches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			
			// Fetch user data for each winner and loser
			const matchData = await Promise.all(allMatches.map(async (match) => {
				const winnerRes = await fetch(`${import.meta.env.VITE_BACKENDURL}/users/${match.winnerId}`, {
					method: "GET",
					credentials: "include",
				});
				const winnerData = await winnerRes.json();
				
				const loserRes = await fetch(`${import.meta.env.VITE_BACKENDURL}/users/${match.looserId}`, {
					method: "GET",
					credentials: "include",
				});
				const loserData = await loserRes.json();
				
				return {
					...match,
					winnerName: winnerData.name,
					loserName: loserData.name,
				};
			}));
			
			setAllMatches(matchData);
		};
		
		fetchMatches();
	}, [matchWon, matchLost]);
	
	// Fetch all users
	useEffect(() => {
		const fetchUsers = async () => {
			const res = await fetch(`${import.meta.env.VITE_BACKENDURL}/users`, {
				method: "GET",
				credentials: "include",
			});
			const data = await res.json();
			setAllUsers(data);
		};
		
		fetchUsers();
	}, []);

	// Handle success progress
	useEffect(() => {
		if (succes2Ref.current) {
			const percent = SuccesResult();
			const offset = 320 - (320 * percent) / 100;
			succes2Ref.current.style.strokeDashoffset = offset.toString();
		};
	}, [achievements]);
	
	// Handle match progress
	useEffect(() => {
		if (match2Ref.current) {
			const percent = MatchResult();
			const offset = 320 - (320 * percent) / 100;
			match2Ref.current.style.strokeDashoffset = offset.toString();
		};
	}, [matchLost, matchWon]);
	
	// Handle blob movement
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

	// Return the percentage of unlocked achievements
	const SuccesResult = () => {
		let res = 0;
		const achievementsDone = achievements.filter(achievement => achievement.unlocked === true);
		if (achievementsDone.length > 0) {
			res = Math.floor((achievementsDone.length / (achievements.length)) * 100);
		}
		return res;
	};
	
	// Return the percentage of matches won
	const MatchResult = () => {
		let res = 0;
		if (matchWon.length + matchLost.length > 0) {
			res = Math.floor((matchWon.length / (matchWon.length + matchLost.length)) * 100);
		}
		return res;
	};
	
	// Handle name animation
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
					
			if(iteration >= nameRef.current.dataset.value.length) { 
				clearInterval(nameinterval);
			}
					
			iteration += 1 / 6;
		}, 30);
	};
	
	// Handle succes animation
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
		
			if(iteration >= succesRef.current.dataset.value.length) { 
				clearInterval(succesinterval);
			}
		
			iteration += 1 / 6;
		}, 30);
	};
	
	// Handle match animation
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
		
			if(iteration >= matchRef.current.dataset.value.length) { 
				clearInterval(matchinterval);
			}
		
			iteration += 1 / 6;
		}, 30);
	};
	
	// Handle history animation
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
	
			if(iteration >= historyRef.current.dataset.value.length) { 
				clearInterval(historyinterval);
			}
		
			iteration += 1 / 6;
		}, 30);
	};

	// Return opponent of (me) from (match)
	const Opponent = (match, me) => {
		const opponentId = match.winnerId === me.id ? match.looserId : match.winnerId;
		const opponent = allUsers.find((user) => user.id === opponentId);
		return opponent;
	};
	
	// Handle the display of locked achievements
	const toggleUnlock = () => {
		setShowLocked(!showLocked);
	};
		
	// Handle popup display
	const handleUserClick = (user) => {
		setSelectedUser(user);
		setIsOpen(true);
	};
	
	// Handle popup close
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
									<p className="Profile-screen-card-text">Niveau :{elo}</p>
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
								<span className="Profile-screen-card-title Profile-achivement-button" data-value="Succès" onMouseOver={SuccesCascade} ref={succesRef} onClick={toggleUnlock}>Succès</span>
								<div className="Profile-achivement-progress">
    								<div className="Profile-achivement-progress-bar">
      									<svg className="Profile-achivement-svg">
        									<circle cx="50" cy="50" r="50" ref={succes1Ref}></circle>
        									<circle cx="50" cy="50" r="50" ref={succes2Ref}></circle>
      									</svg>
      									<div className="Profile-achivement-progress-number">
       										<h2>{SuccesResult()}<span>%</span></h2>
      									</div>
    								</div>
  								</div>
								<div className="Profile-screen-achivement-user">
									<InitAchievements userId={user.id} showLocked={showLocked}/>
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
        									<circle cx="50" cy="50" r="50" ref={match1Ref}></circle>
        									<circle cx="50" cy="50" r="50" ref={match2Ref}></circle>
      									</svg>
      									<div className="Profile-match-progress-number">
       										<h2>{MatchResult()}<span>%</span></h2>
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
														onClick={() => handleUserClick(Opponent(match, user))}
													>
														<td >
															<div className="Profile-match-td">
																<img src={Opponent(match, user).profilePicture} alt="Photo de profil de l'adversaire" className="Profile-match-picture" />
																<p>{Opponent(match, user).name}</p>
															</div>
														</td>
														<td>{match.winnerScore}/{match.looserScore}</td>
													</tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{ /* Popup */ }
				{selectedUser && (
					<Popup isOpen={isOpen} isClose={handleClose}>
						<SpecProfile user={selectedUser} handleUserClick={handleUserClick} />
					</Popup>
				)}
				<Invitaion />
			</div>
		</div>
	);
}
