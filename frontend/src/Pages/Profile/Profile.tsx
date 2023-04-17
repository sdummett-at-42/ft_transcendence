import { useState, useEffect } from "react";
import "./Profile.css"

export default function Profile({ userId }) {
	const [user, setUser] = useState(null);
	const [matchData, setMatchData] = useState(null);

	useEffect(() => {
		// Fetch user data
		fetch(`http://localhost:3001/users/${userId}`, {
			method: "GET",
			credentials: "include",
		})
			.then((response) => response.json())
			.then((data) => setUser(data))
			.catch((error) => console.error(error));

		// Fetch match data
		fetch(`http://localhost:3001/users/${userId}/matchs`, {
			method: "GET",
			credentials: "include",
		})
			.then((response) => response.json())
			.then((data) => setMatchData(data))
			.catch((error) => console.error(error));
	}, [userId]);

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
		<div className="profile-container">
			<h2>{name}</h2>
			<img
				src={profilePicture}
				alt="Profile"
				className="profile-picture"
			/>
			<p>Elo: {elo}</p>
			<p>
				Wins/Losses: {matchWon.length}/{matchLost.length}
			</p>

			<h3>Matches</h3>
			<table className="match-table">
				<thead>
					<tr>
						<th>Winner</th>
						<th>Loser</th>
						<th>Winner Score</th>
						<th>Looser Score</th>
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
		</div>
	);
}
