import { useState, useEffect } from "react";

export default function Settings() {
	const [user, setUser] = useState(null);

	useEffect(() => {
		async function fetchUser() {
			const response = await fetch("http://localhost:3001/users/me", {
				method: "GET",
				credentials: "include",
			});
			const userData = await response.json();
			setUser(userData);
		}

		fetchUser();
	}, []);

	if (!user) {
		return <p>Loading...</p>;
	}

	function handleNameChange() {
		console.log("handleNameChange");
		fetch("http://localhost:3001/users/me", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				name: user.name,
			}),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Failed to update name");
				}
			})
			.catch((error) => {
				console.error(error);
			});
	}

	function handlePasswordChange() {
		console.log("handlePasswordChange");
		// TODO: Implement password change
	}

	function handleLogout() {
		console.log("handleLogout");
		fetch("http://localhost:3001/auth/logout", {
			method: "DELETE",
			credentials: "include",
		})
			.then(() => {
				window.location.href = "http://localhost:5173/";
			})
			.catch((error) => {
				console.error("Logout failed: ", error);
			});
	}

	function handleAccountDeletion() {
		console.log("handleAccountDeletion");
		fetch("http://localhost:3001/users/me", {
			method: "DELETE",
			credentials: "include",
		})
			.then((response) => {
				window.location.href = "http://localhost:5173/";
			})
	}

	function handle2faToggle() {
		console.log("handle2faToggle");
		// TODO: Implement 2FA toggle
	}

	console.log(`2fa is enabled: ${JSON.stringify(user.twofactorIsEnabled)}`)
	return (
		<div>
			<h2>Settings</h2>
			<p>Logged in as {user.name}</p>
			<div>
				<label>
					Name:
					<input
						type="text"
						value={user.name}
						onChange={(event) =>
							setUser({ ...user, name: event.target.value })
						}
					/>
				</label>
				<button onClick={handleNameChange}>Change Name</button>
			</div>
			<div>
				<label>
					Current Password:
					<input type="password" />
				</label>
				<label>
					New Password:
					<input type="password" />
				</label>
				<button onClick={handlePasswordChange}>Change Password</button>
			</div>
			<button onClick={handleLogout}>Logout</button>
			<button onClick={handleAccountDeletion}>Delete Account</button>
			<button onClick={handle2faToggle}>
				{user.twofactorIsEnabled ? "Disable 2FA" : "Enable 2FA"}
			</button>
		</div>
	);
}
