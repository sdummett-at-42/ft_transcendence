import React, { useState, useEffect } from "react";
import "./Stats.css";

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

	return (
		<div>
			<table>
				<thead>
					<tr>
						<th>Rank</th>
						<th>Name</th>
						<th>Wins</th>
						<th>Matches Played</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user, index) => (
						<tr key={user.id} onClick={() => handleUserClick(user)}>
							<td>{index + 1}</td>
							<td>
								<img
									src={user.profilePicture}
									alt="Profile"
									className="profile-picture"
								/>
								{user.name}
							</td>
							<td>{user.matchWon.length}</td>
							<td>
								{user.matchWon.length + user.matchLost.length}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{selectedUser && (
				<UserPopup
					user={selectedUser}
					onClose={() => setSelectedUser(null)}
				/>
			)}
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
				<h2>{user.name}</h2>
				<img
					src={user.profilePicture}
					alt="Profile"
					className="profile-picture"
				/>
				<p>Wins: {user.matchWon.length}</p>
				<p>Losses: {user.matchLost.length}</p>
				{/* Add more details as needed */}
			</div>
		</div>
	);
}