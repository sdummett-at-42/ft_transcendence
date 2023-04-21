import React, { useEffect } from "react";
import "./Loading.css";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { useNavigate  } from "react-router-dom";

export default function Loading() {
  const { isLoading } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      navigate("/home");
    }
  }, [isLoading]); 

  return (
    <div id="escapingBallG">
      <div id="escapingBall_1" className="escapingBallG"></div>
    </div>
  );
}
