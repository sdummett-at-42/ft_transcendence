import React, { useEffect, useContext } from "react";
import "./Navbar.css";
import Logo42 from "../../assets/42_Logo.png";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGear } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../../context/UserContext";

export default function Navbar() {
	const { user } = useContext(UserContext);

	return (
		user && (
			<nav className="Navbar-nav">
				<div className="Navbar-nav-section" id="Navbar-left">
					<Link to="/home">
						<img
							className="LoginSelector-invert-effect Navbar-logo"
							src={Logo42}
							alt="Logo-ecole-42"
							draggable="false"
						/>
					</Link>
					<Link
						to="/lobby"
						style={{ textDecoration: "none", color: "whitesmoke" }}
						id="Navbar-pong"
					>
						Pong
					</Link>
				</div>

				<div className="Navbar-nav-section" id="Navbar-mid">
					<Link
						to="/achievements"
						style={{ textDecoration: "none", color: "whitesmoke" }}
						id="Navbar-achivement"
					>
						Succès
					</Link>
					<Link
						to="/stats"
						style={{ textDecoration: "none", color: "whitesmoke" }}
						id="Navbar-stats"
					>
						Statistiques
					</Link>
					<Link
						to="/chat"
						style={{ textDecoration: "none", color: "whitesmoke" }}
						id="Navbar-chat"
					>
						Messages
					</Link>
				</div>

				<div className="Navbar-nav-section" id="Navbar-right">
					<div>
						{user && (
							<Link
								to="/profile"
								style={{
									textDecoration: "none",
									color: "whitesmoke",
								}}
							>
								<div id="Navbar-profile">
									<img
										id="Navbar-profile-picture"
										className="Navbar-logo"
										src={user.profilePicture}
										alt="Ma Photo de profil"
										draggable="false"
									/>
									<div id="Navbar-profile-name">
										{user.name}
									</div>
								</div>
							</Link>
						)}
					</div>
					<div id="Navbar-option">
						<Link to="/settings">
							<FontAwesomeIcon
								icon={faUserGear}
								style={{
									textDecoration: "none",
									color: "whitesmoke",
								}}
								size="lg"
							/>
						</Link>
					</div>
				</div>
			</nav>
		)
	);
}
