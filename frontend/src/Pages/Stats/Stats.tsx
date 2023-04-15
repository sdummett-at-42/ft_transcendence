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
	return (
		<ul>
			{users.map((user, index) => (
				<li key={user.id}>
					#{index + 1} {user.name} {user.matchWon.length}{" "}
					{user.matchWon.length + user.matchLost.length}
				</li>
			))}
		</ul>
	);
}
