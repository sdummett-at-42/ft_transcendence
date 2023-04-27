import React, { useState, useEffect } from "react";
import "./Stats.css";
import Popup from "../Popup/Popup";
import SpecProfile from "../Profile/SpecProfile/SpecProfile";
import Invitaion from "../Invitaion/Invitaion";

export default function InitStats({ user }) {
	const [users, setUsers] = useState([]);
	const [matchData, setMatchData] = useState(null);
 
	// Fetch match data
	useEffect(() => {
		fetch(`http://localhost:3001/users/${user.id}/matchs`, {
			method: "GET",
			credentials: "include",
		})
		.then((response) => response.json())
		.then((data) => setMatchData(data))
		.catch((error) => console.error(error));
	}, [user]);

	// Fetch users
	useEffect(() => {
		async function fetchUsers() {
			const response = await fetch("http://localhost:3001/users/", {
				method: "GET",
				credentials: "include",
			});
			const data = await response.json();
			setUsers(data);
		}

		fetchUsers();
	}, []);

	// Sort users by elo
	const sortedUsers = [...users].sort((a, b) => b.elo - a.elo);

	if (!matchData) return <div>Loading...</div>;

	return <UserList users={sortedUsers} match={matchData} />;
}

function UserList({ users, match }) {
	const { matchWon, matchLost } = match;
	
	// Store all matches and all users
	const [allMatches, setAllMatches] = useState([]);
	const [allUsers, setAllUsers] = useState([]);
	
	// Handle popup
	const [selectedUser, setSelectedUser] = useState(null);
	const [isOpen, setIsOpen] = useState(false);

	// Merge matchWon and matchLost into a single array
	useEffect(() => {
		const fetchMatches = async () => {
			// Combine the matchWon and matchLost arrays into a single array
			const allMatches = [...matchWon, ...matchLost];
		
			// Sort the matches based on createdAt
			allMatches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
		
			// Fetch user data for each winner and loser
			const matchData = await Promise.all(allMatches.map(async (match) => {
				const winnerRes = await fetch(`http://localhost:3001/users/${match.winnerId}`, {
					method: "GET",
					credentials: "include",
				});
				const winnerData = await winnerRes.json();
			
				const loserRes = await fetch(`http://localhost:3001/users/${match.looserId}`, {
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
			const res = await fetch("http://localhost:3001/users", {
				method: "GET",
				credentials: "include",
			});
			const data = await res.json();
			setAllUsers(data);
		};
		
		fetchUsers();
	}, []);

	// Return opponent of (me) from (match)
	const Opponent = (match, me) => {
		const opponentId = match.winnerId === me.id ? match.looserId : match.winnerId;
		const opponent = allUsers.find((user) => user.id === opponentId);
		return opponent;
	};

	// Handle user click
	const handleUserClick = (user) => {
		setSelectedUser(user);
		setIsOpen(true);
	};

	// Handle popup close
	const handleClose = () => {
		setIsOpen(false);
		setSelectedUser(null);
	};

	// Filter users that have played at least one match
	const filteredUsers = users.filter((user) => {
		return user.matchWon.length + user.matchLost.length > 0;
	});

	return (
		<div>
			<div className="Stats">
				<h1>Classement</h1>
				<div className={`${filteredUsers.length === 0 ? "Stats-table-empty" : "Stats-table-container"}`}>
					<table className="Stats-table">
						<thead className="Stats-table-head">
							<tr>
								<th>Rang</th>
								<th>Niveau</th>
								<th>Nom</th>
								<th>Victoires</th>
								<th>Parties jouées</th>
							</tr>
						</thead>
						{filteredUsers.length === 0 ? null : (
							<tbody className="Stats-table-body">
								{filteredUsers.map((user, index) => (
									<tr
										key={index}
										onClick={() => handleUserClick(user)}
										className={`Stats-table-row ${index === 0 ? "Stats-table-row-first" : index === 1 ? "Stats-table-row-second" : index === 2 ? "Stats-table-row-third" : ""}`}
									>
										<td className="Stats-td">{index + 1}</td>
										<td className="Stats-td">{user.elo}</td>
										<td className="Stats-td Stats-profile">
											<img
												src={user.profilePicture}
												alt="Profile"
												className="Stats-picture"
											/>
											{user.name}
										</td>
										<td className="Stats-td">{user.matchWon.length}</td>
										<td className="Stats-td">
											{user.matchWon.length + user.matchLost.length}
										</td>
									</tr>
								))}
							</tbody>
						)}
					</table>
				</div>
			</div>
			{filteredUsers.length === 0 ? <p className="Stats-no-match">Aucun match</p> : (
				selectedUser && (
					<Popup isOpen={isOpen} isClose={handleClose}>
						<SpecProfile user={selectedUser} handleUserClick={handleUserClick}/>
					</Popup>
				)
			)}
			 <Invitaion />
		</div>
	);
};
