import React, { useState, useEffect } from "react";
import "./SpecProfile.css";
import InitAchievements from "../../Achievements/Achievements";


export default function SpecProfile({ user, handleUserClick }) {
    const [allUsers, setAllUsers] = useState([]);
    const [allMatches, setAllMatches] = useState([]);

    // fetch all users
    useEffect(() => {
        async function GetAllUsers() {
            const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/users`, {
                method: "GET",
                credentials: "include",
            });
            const data = await response.json();
            setAllUsers(data);
        }

        GetAllUsers();
    },[]);

    // fetch all match played by user
    useEffect(() => {

        setAllMatches([]);

        async function GetAllMatches() {
            const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/users/${user.id}/matchs`, {
				method: "GET",
				credentials: "include",
			});
			const data = await response.json();
            data.matchLost.forEach((match) => {
                setAllMatches((prev) => [...prev, match]);
            });
            data.matchWon.forEach((match) => {
                setAllMatches((prev) => [...prev, match]);
            });
        }

        GetAllMatches();
    }, [user]);

    // Return opponent of (me) from (match)
	const Opponent = (match, me) => {
		const opponentId = match.winnerId === me.id ? match.looserId : match.winnerId;
		const opponent = allUsers.find((user) => user.id == opponentId);
		return opponent;
	};

    if (!user || !allMatches || !allUsers) return <div>Chargement...</div>;
    
    return (
        <div className="Profile-screen-card-popup">
			<div className="Profile-screen-card-overlay"></div>
            <div className="Profile-screen-card-content">
				<div className="Profile-screen-card-popup-content">
					<img
						src={user.profilePicture}
						alt={`Photo de profil de ${user.name}`}
						className="Profile-picture"
						draggable="false"
					/>
                	<div className="Profile-screen-card-user">
                    	<span className="Profile-screen-card-title">{user.name}</span>
						<p className="Profile-screen-card-text">Niveau :{user.elo}</p>
                    </div>
					<span className="Profile-screen-card-title">Historique</span>
					<div className="Profile-match-container Profile-screen-card-text">
						{allMatches.length === 0 ? (
							<p className="Profile-screen-card-text">Aucun match</p>
						) : (
							<table className="Profile-match-table-popup">
								<tbody>
									{allMatches.map((match) => (
										<tr
											key={`match-${match.id}`}
											className={`Profile-match-table-tr ${(match.winnerId === user.id) ? "Profile-match-table-win" : "Profile-match-table-losse"}`}
											onClick={() => handleUserClick(Opponent(match, user))}
										>
											<td >
                                                {Opponent(match, user) && (
                                                <div className="Profile-match-td">
													<img src={Opponent(match, user).profilePicture} alt="Photo de profil de l'adversaire" className="Profile-match-picture" />
													<p>{Opponent(match, user).name}</p>
												</div>
                                                )}
											</td>
												<td>{match.winnerScore}/{match.looserScore}</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
					<span className="Profile-screen-card-title">Succès</span>
					<InitAchievements userId={user.id} showLocked={false} />
				</div>
			</div>
	    </div>
    );
}