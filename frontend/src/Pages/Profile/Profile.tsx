import React, { useRef, useState, useEffect } from "react";
import "./Profile.css";
import loadingGif from "../../assets/Loading.mp4";
import { useNavigate } from "react-router-dom";

export default function Profile() {

    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [errorMessages, setErrorMessages] = useState({});
    const usernameInputRef = useRef(null);
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
        setErrorMessages(prevErrors => ({...prevErrors, username: ""}));
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
            console.log(res);
            if (res.status == 401) {
                naviguate("/unauthorized");
                return;
            }
            else if (res.status == 400) {
                return;
            }
            else if (res.status == 409) {
                setErrorMessages(prevErrors => ({...prevErrors, username: "Le nom d'utilisateur est déjà pris"}));
                return;
            }
            else if (res.status == 200) {
                window.location.reload();
            }
            return res.json();
        })
    }

    function encodeToPNG(base64Image: string): string {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.src = `data:image/jpeg;base64,${base64Image}`;
      
        return new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get 2D context of canvas'));
              return;
            }
            ctx.drawImage(img, 0, 0);
            try {
              const pngDataUrl = canvas.toDataURL('image/png');
              resolve(pngDataUrl);
            } catch (err) {
              reject(err);
            }
          };
      
          img.onerror = (err) => {
            reject(err);
          };
        });
      }

    const [switchOn, setSwitchOn] = useState(true);

    function handle2fa() {
        setSwitchOn(!switchOn);
        console.log(switchOn);
        if (switchOn) {
            fetch('http://localhost:3001/auth/2fa/generate', {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
            })
            .then(res => {
                console.log(res);
                if (res.status == 401) {
                    naviguate("/unauthorized");
                    return;
                }
                else if (res.status == 400) {
                    return;
                }
                else if (res.status == 200) {
                    const DoubleFA = res.json();
                    console.log(DoubleFA);
                    // encodeToPNG(DoubleFA);
                }
                return res.json();
            })
            .then(data => {
                console.log(data);
            })
        }
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
                        {errorMessages.username && <p className="LoginSelector-error">{errorMessages.username}</p>}

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
                        Activer la double authentification
                        <label className="Profil-switch">
                        <input className="Profil-input"
                            type="checkbox"
                            onClick={e => {
                                handle2fa();
                            }}
                            />
                        <span className="Profil-slider Profil-round"></span>
                        </label>
                        
                    </div>

                </div>
            </div>
        </div>
    );
}