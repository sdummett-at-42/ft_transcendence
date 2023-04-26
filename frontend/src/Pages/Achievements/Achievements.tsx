import React, { useState, useEffect } from "react";
import "./Achievements.css";

export default function InitAchievements({ userId, showLocked }) {
	const [achievements, setAchievements] = useState([]);

	useEffect(() => {
		async function fetchAchievements(userId: number) {
			const [userAchievementsRes, allAchievementsRes] = await Promise.all(
				[
					fetch(
						`http://localhost:3001/users/${userId}/achievements`,
						{
							method: "GET",
							headers: { "Content-Type": "application/json" },
							credentials: "include",
						}
					),
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
		fetchAchievements(userId);
	}, [userId]);
	
	return <Achievements achievements={achievements} showLocked={showLocked} />;
}

function Achievements({ achievements, showLocked }) {

	return (
		<div className="achievements">
			{achievements.map(
				(achievement) =>
					(achievement.unlocked || showLocked) && (
						<div
							key={achievement.id}
							className={`achievement-card ${
								achievement.unlocked
								? "achievement-unlocked"
								: "achievement-locked"
							}`}
						>
							<div
								className="achievement-badge"
								style={{
									backgroundImage: `url(${achievement.icon})`,
								}}
							></div>
							<div className="achievement-details">
								<div className="achievement-title">
									{achievement.name}
								</div>
								<div className="achievement-description">
									{achievement.description}
								</div>
							</div>
						</div>
					)
			)}
		</div>
	);
}
