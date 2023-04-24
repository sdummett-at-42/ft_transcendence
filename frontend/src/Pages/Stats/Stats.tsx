import React, { useState, useEffect } from "react";
import "./Stats.css";
// import InitAchievements from "../../Achievements/Achievements";
import Profile from "../Profile/Profile";

export default function InitStats() {
	const [users, setUsers] = useState([]);

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

	const sortedUsers = [...users].sort((a, b) => b.elo - a.elo);

	return <UserList users={users} />;
}

function UserList({ users }) {
	const [selectedUser, setSelectedUser] = useState(null);

	const handleUserClick = (user) => {
		setSelectedUser(user);
	};

	const filteredUsers = users.filter((user) => {
		return user.matchWon.length + user.matchLost.length > 0;
	});

	return (
		<div>
			<div className="Stats">
				<h1>Classement</h1>
				<div className="Stats-table-container">
			<table className="Stats-table">
				<thead className="Stats-table-head">
					<tr>
						<th>Rang</th>
						<th>Elo</th>
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
									{user.matchWon.length +
										user.matchLost.length}
								</td>
							</tr>
						))}
				</tbody>
						)}
			</table>
			{filteredUsers.length === 0 ? <p>Aucun match</p> : (
				selectedUser && (
					<UserPopup
						user={selectedUser}
						onClose={() => setSelectedUser(null)}
					/>
				)
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
