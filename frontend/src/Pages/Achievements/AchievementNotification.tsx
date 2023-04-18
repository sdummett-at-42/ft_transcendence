import React, { useEffect, useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import "./AchievementNotification.css";

function AchievementNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [achievementName, setAchievementName] = useState("");
  const { achievementSocketRef } = useContext(UserContext);

  useEffect(() => {
    // Set up socket listener for new achievements
    achievementSocketRef.current.on("newAchievement", (data) => {
      setShowNotification(true);
      setAchievementName(data.achievementName);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    });
  }, [achievementSocketRef]);

  return (
    <div className={`achievement-notification ${showNotification ? "visible" : ""}`}>
      {achievementName && <div>{achievementName} unlocked!</div>}
    </div>
  );
}

export default AchievementNotification;
