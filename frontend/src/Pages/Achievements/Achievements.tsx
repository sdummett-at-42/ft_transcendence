import React, { useState, useEffect } from "react";
import "./Achievements.css";
import Invitaion from "../Invitaion/Invitaion";

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
	const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#800080', '#FFA500', '#008080', '#FFC0CB', '#000080', '#008000', '#800000', '#808000', '#808080', '#C0C0C0', '#FF6347'];

	const itemsWithGradient = achievements.map((achievement, index) => {
		const gradient = `linear-gradient(to right, ${colors[index % colors.length]}, ${colors[(index + 1) % colors.length]})`;
		return (
			(achievement.unlocked || showLocked) && (
			<div
				key={achievement.id}
				className={`achievement-card ${
					achievement.unlocked ? "achievement-unlocked" : "achievement-locked"
				}`}
				style={{ background: gradient }}
			>
				<div>
					<div className="achievement-details">
						<div className="achievement-title">{achievement.name}</div>
						<div className="achievement-description">{achievement.description}</div>
					</div>
				</div>
			</div>
			)
		);
	});

	return <div className="achievements">{itemsWithGradient}</div>;
}
