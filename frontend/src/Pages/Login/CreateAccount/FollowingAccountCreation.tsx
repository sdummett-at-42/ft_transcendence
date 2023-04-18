import React, { useRef, useState, useEffect } from "react";
import "./FollowingAccountCreation.css";
import loadingGif from "../../../assets/Loading.mp4";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import Loading from "../../Loading/Loading";

export default function FollowingAccountCreation() {
	const { user, isLoading } = useContext(UserContext);
	const [image, setImage] = useState("");
	const [loading, setLoading] = useState(true);
	const usernameInputRef = useRef(null);
	const naviguate = useNavigate();
	const location = useLocation();
	const myProps = location.state;

	// Get a random image from Unsplash API
	useEffect(() => {
		async function fetchData() {
			const response = await fetch(
				"https://api.unsplash.com/photos/random",
				{
					headers: {
						Authorization:
							"Client-ID 1F4RENAqLD5f8pwS2FsG1M5hTEg-6KrKvB5hNp6tcJs",
					},
				}
			);
			const data = await response.json();
			setImage(data.urls.regular);
			setLoading(false);
		}
		fetchData();
	}, []);

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

		fetch("http://localhost:3001/users/me", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				name: username,
				email: JSON.stringify(myProps.email).slice(1, -1),
				profilePicture: image,
			}),
		}).then((res) => {
			if (res.status == 200) {
				naviguate("/home");
				return;
			}
		});
	}

	useEffect(() => {
		if (!isLoading && user) naviguate("/home");
	}, [user, naviguate, isLoading]);

	if (isLoading || user) {
		return <Loading />;
	} else
		return (
			<div className="LoginSelector-body">
				<div className="LoginSelector-card">
					<div className="LoginSelector-card-content">
						<h3 className="LoginSelector-card-title">
							Personnalisez votre photo de profile:
						</h3>

						<div id="Profil-image-wrapper">
							{loading ? (
								<video
									src={loadingGif}
									autoPlay
									loop
									muted
									className="Profil-image"
								/>
							) : (
								<div>
									{image && (
										<img
											src={image}
											alt="Preview"
											className="Profil-image"
										/>
									)}
								</div>
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
									defaultValue={JSON.stringify(
										myProps.name
									).slice(1, -1)}
									ref={usernameInputRef}
									required
								/>

								<input
									className="LoginSelector-button LoginSelector-input LoginSelector-submit"
									type="button"
									value="Valider"
									onClick={(e) => {
										handleLoginForm();
									}}
								/>
							</form>

							<Link
								to="/home"
								style={{
									color: "white",
									textDecoration: "none",
								}}
							>
								<input
									className="LoginSelector-button LoginSelector-input LoginSelector-submit Profil-skip-button"
									type="button"
									value="Passer"
								/>
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
}
