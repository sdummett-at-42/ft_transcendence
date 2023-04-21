import React, { useEffect, useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import "./AchievementNotification.css";

function AchievementNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState([]);
  const { notificationSocketRef } = useContext(UserContext);

  useEffect(() => {
    // Set up socket listener for new achievements
    notificationSocketRef.current.on("newAchievement", (data) => {
      setAchievementQueue((prevQueue) => [...prevQueue, data]);
    });
  }, [notificationSocketRef]);

  useEffect(() => {
    if (achievementQueue.length > 0 && !showNotification) {
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        setAchievementQueue((prevQueue) => prevQueue.slice(1));
      }, 3000);
    }
  }, [achievementQueue, showNotification]);

  // Remove achievements that have already been displayed
  const filteredQueue = achievementQueue.filter(
    (achievement, index) => index === 0 || achievement.achievementName !== achievementQueue[index - 1].achievementName
  );

  return (
    <div className={`achievement-notification ${showNotification ? "visible" : ""}`}>
      {filteredQueue.length > 0 && <div>{filteredQueue[0].achievementName} unlocked!</div>}
    </div>
  );
}

export default AchievementNotification;
