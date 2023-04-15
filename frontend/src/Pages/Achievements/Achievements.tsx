import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import "./Achievements.css";

export default function InitAchievements() {
	const [achievements, setAchievements] = useState([]);

	useEffect(() => {
		async function fetchAchievements() {
			const [userAchievementsRes, allAchievementsRes] = await Promise.all(
				[
					fetch("http://localhost:3001/users/me/achievements", {
						method: "GET",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
					}),
					fetch("http://localhost:3001/achievements", {
						method: "GET",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
					}),
				]
			);
			if (
				userAchievementsRes.status === 200 &&
				allAchievementsRes.status === 200
			) {
				const userAchievementsJson = await userAchievementsRes.json();
				const allAchievementsJson = await allAchievementsRes.json();
				console.log(
					`userAchievementsJson: ${JSON.stringify(
						userAchievementsJson
					)}`
				);
				console.log(
					`allAchievementsJson: ${JSON.stringify(
						allAchievementsJson
					)}`
				);
				const userAchievementIds =
					userAchievementsJson.achievements.map(
						(achievement) => achievement.id
					);
				const achievements = allAchievementsJson.map((achievement) => {
					const isUnlocked = userAchievementIds.includes(
						achievement.id
					);
					return { ...achievement, unlocked: isUnlocked };
				});
				setAchievements(achievements);
			} else {
				// console.log(`Achievements => response.status: ${response.status}.`);
				console.log(`Fetching achievements failed.`);
			}
		}
		fetchAchievements();
	}, []);

	return <Achievements achievements={achievements} />;
}

function Achievements({ achievements }) {
	return (
		<div className="achievements">
			{achievements.map((achievement) => (
				<Card
					key={achievement.id}
					className={`achievement-card ${
						achievement.unlocked
							? "achievement-unlocked"
							: "achievement-locked"
					}`}
				>
					<div
						className="achievement-icon"
						style={{ backgroundImage: `url(${achievement.icon})` }}
					></div>
					<Card.Body>
						<Card.Title className="achievement-title">
							{achievement.name}
						</Card.Title>
						<Card.Text className="achievement-description">
							{achievement.description}
						</Card.Text>
					</Card.Body>
				</Card>
			))}
		</div>
	);
}