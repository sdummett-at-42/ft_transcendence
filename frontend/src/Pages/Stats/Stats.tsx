import React, { useState, useEffect } from "react";
import "./Stats.css";
import InitAchievements from "../Achievements/Achievements";
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
			<table>
				<thead>
					<tr>
						<th>Rank</th>
						<th>Elo</th>
						<th>Name</th>
						<th>Wins</th>
						<th>Matches Played</th>
					</tr>
				</thead>
				{filteredUsers.length === 0 ? null : (
					<tbody>
						{filteredUsers.map((user, index) => (
							<tr
								key={user.id}
								onClick={() => handleUserClick(user)}
							>
								<td>{index + 1}</td>
								<td>{user.elo}</td>
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
									{user.matchWon.length +
										user.matchLost.length}
								</td>
							</tr>
						))}
					</tbody>
				)}
			</table>
			{filteredUsers.length === 0 ? <p>No users to display</p> : null}
			{selectedUser && (
				<UserPopup
					user={selectedUser}
					onClose={() => setSelectedUser(null)}
				/>
			)}
		</div>
	);
}
