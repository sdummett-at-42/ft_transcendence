import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';

export default function InitAchievements() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    async function fetchAchievements() {
      const response = await fetch("http://localhost:3001/users/me/achievements", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (response.status === 200) {
        const json = await response.json();
        setAchievements(json.achievements);
      } else {
        console.log(`Achievements => response.status: ${response.status}.`);
        console.log(`Fetching achievements failed.`);
      }
    }
    fetchAchievements();
  }, []);

  return <Achievements achievements={achievements} />;
}


function Achievements({ achievements }) {
  return (
    <>
      {achievements.map((achievement) => (
        <Card key={achievement.id}>
          <Card.Body>
            <Card.Title>{achievement.title}</Card.Title>
            <Card.Text>{achievement.description}</Card.Text>
          </Card.Body>
        </Card>
      ))}
    </>
  );
}