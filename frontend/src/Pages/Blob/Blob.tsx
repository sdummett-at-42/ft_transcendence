import React, { useEffect } from "react";
import "./Blob.css";

export default function Blob() {
		// Handle blob movement
		useEffect(() => {
			const blob = document.getElementById("blob");
			
			window.onpointermove = (event: PointerEvent) => {
				const { clientX, clientY } = event;
				blob?.animate({
					left: `${clientX}px`,
					top: `${clientY}px`,
				}, { duration: 3000, fill: "forwards" });
			};
		}, []);

		return (
			<div>
				<div id="blob"></div>
				<div id="blur"></div>
			</div>
		);
}