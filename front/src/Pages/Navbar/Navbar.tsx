import React, { useState, useEffect } from "react";
import "./Navbar.css"
import { Link } from "react-router-dom";
import Logo42 from "../../assets/42_Logo.png"

export default function Navbar() {

    const [data, setData] = useState();

    // fetch data
    const dataFetch = async () => {
        try {
            return (
                fetch("http://localhost:3001/users/me", {
                    method: "GET",
                    credentials: "include"
                })
                .then((res) => res.json())
                .then((d) => setData(d))
            );
        }
        catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        dataFetch();
    }, []);

    return (
        <nav className="Navbar-nav">
            <div className="Navbar-nav-section" id="Navbar-left">
                <Link to="/home"><img className="Login-invert-effect Navbar-logo" src={Logo42} alt="Logo-ecole-42" /></Link>
                <Link to="/game" style={{textDecoration: 'none', color: 'whitesmoke'}}>
                    Pong
                </Link>
            </div>

            <div className="Navbar-nav-section" id="Navbar-mid">
                <Link to="/succes" style={{textDecoration: 'none', color: 'whitesmoke'}}>Succes</Link>
                <Link to="/stats" style={{textDecoration: 'none', color: 'whitesmoke'}}>Statistique</Link>
                <Link to="/message" style={{textDecoration: 'none', color: 'whitesmoke'}}>Messages</Link>
            </div>

            <div className="Navbar-nav-section" id="Navbar-right">
                <div >
                    <img id="Navbar-profil-picture" className="Navbar-logo" src="https://play-lh.googleusercontent.com/IeNJWoKYx1waOhfWF6TiuSiWBLfqLb18lmZYXSgsH1fvb8v1IYiZr5aYWe0Gxu-pVZX3" alt="myProfilePicture" />
                </div>
                <div>
                    {/* {data.map((dataObj, index) => {
                        return (
                            <div>
                                {dataObj.name}
                            </div>
                        );
                    }
                )} */}
                </div>
                <Link to="/profil/:self" style={{textDecoration: 'none', color: 'whitesmoke'}}>Profile</Link>
            </div>
        </nav>
    );
}