import React, { useEffect, useContext } from "react";
import "./Navbar.css"
import { Link, useNavigate } from "react-router-dom";
import Logo42 from "../../assets/42_Logo.png"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGear } from "@fortawesome/free-solid-svg-icons"
import { UserContext } from "../../context/UserContext"

export default function Navbar() {

    const { user, setUser } = useContext(UserContext);
    const naviguate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    // fetch data
    const fetchUserData = async () => {
        const response = await fetch("http://localhost:3001/users/me", {
            credentials: 'include',
            method: "GET"
        })
            .then(res => {
                if (res.status == 401) {
                    naviguate("/unauthorized");
                    return;
                }
                return res.json();
            });
        const data = await response;
        setUser(data);
    };

    return (user && (
        <nav className="Navbar-nav">
            <div className="Navbar-nav-section" id="Navbar-left">
                <Link to="/home">
                    <img className="LoginSelector-invert-effect Navbar-logo" src={Logo42} alt="Logo-ecole-42" />
                </Link>
                <Link to="/lobby" style={{textDecoration: 'none', color: 'whitesmoke'}} id="Navbar-pong" >
                        Pong
                </Link>
            </div>

            <div className="Navbar-nav-section" id="Navbar-mid">
                <Link to="/achievements" style={{textDecoration: 'none', color: 'whitesmoke'}} id="Navbar-achivement">
                    Succes
                </Link>
                <Link to="/stats" style={{textDecoration: 'none', color: 'whitesmoke'}} id="Navbar-stats">
                    Statistique
                </Link>
                <Link to="/chat" style={{textDecoration: 'none', color: 'whitesmoke'}} id="Navbar-chat">
                    Messages
                </Link>
            </div>

            <div className="Navbar-nav-section" id="Navbar-right">
                <div>
                    {user && (
						<Link to='/profile' style={{textDecoration: 'none', color: 'whitesmoke'}}>
                        <div id="Navbar-profil">
                            <img id="Navbar-profil-picture" className="Navbar-logo" src={user.profilePicture} alt="myProfilePicture" />
                            <div id="Navbar-profil-name">
                                {user.name}
                            </div>
                        </div>
						</Link>
                    )}
                </div>
                <div id="Navbar-option">
                    <Link to="/settings">
                        <FontAwesomeIcon icon={faUserGear} style={{textDecoration: 'none', color: 'whitesmoke'}} size="lg" />
                    </Link>
                </div>
            </div>
        </nav>
    ));
}