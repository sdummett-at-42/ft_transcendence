import React, { useRef, useState, useEffect } from "react";
import "./Profile.css";
import loadingGif from "../../assets/Loading.mp4";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {

    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(true);
    const usernameInputRef = useRef(null);


    const [userData, setUserData] = useState(null);
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
                // console.log(res);
                if (res.status == 401) {
                    naviguate("/unauthorized");
                    return;
                }
                return res.json();
            });
        const data = await response;
        setUserData(data);
        setImage(data.profilePicture);
        setLoading(false);
    };

    // Handle image upload
    const handleImageChange = (e) => {
        setLoading(true);
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          setImage(reader.result);
          setLoading(false);
        };
    };

    // Handle form submit
    function handleLoginForm() {
        const username = usernameInputRef.current.value;

        if (!username) {
            console.log("No username provided");
            return;
        }

        if (username.length < 3) {
            console.log("Username is too short");
            return;
        }

        fetch('http://localhost:3001/users/me', {
            method: 'PATCH',
			headers: { "Content-Type": "application/json" },
			credentials: 'include',
            body: JSON.stringify({
                name: username,
                email: userData?.email,
                profilePicture: image,
            }),
        })
        .then(res => {
            if (res.status == 401) {
                naviguate("/unauthorized");
                return;
            }
            return res.json();
        })
    }

    return (
        <div className="Profile-body">
            <div className="Profile-card">

                <h3 className="LoginSelector-card-title">Modifiez votre profile:</h3>

                <div id="Profil-image-wrapper">

                    {loading ? (
                        <video src={loadingGif} autoPlay loop muted className="Profil-image" />
                        ) : (
                        <div>{image && <img src={image} alt="Preview" className="Profil-image" />}</div>
                    )}
    
                    <input
                        id="Profil-button"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>

                <div className="LoginSelector-card-subtitle">

                    <form>
                        <input
                            className="LoginSelector-button LoginSelector-input"
                            type="text"
                            placeholder="Pseudonyme"
                            defaultValue={userData?.name}
                            ref={usernameInputRef}
                            required
                        />

                        <input
                            className="LoginSelector-button LoginSelector-input LoginSelector-submit"
                            type="button"
                            value="Mettre à jour"
                            onClick={e => {
                                handleLoginForm();
                            }}
                        />

                    </form>

                    <div className="2fa">
                        <input
                            className="LoginSelector-button LoginSelector-input LoginSelector-submit Profil-skip-button"
                            type="button"
                            value="Activer la double authentification"
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}