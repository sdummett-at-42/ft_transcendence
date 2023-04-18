import React, { useRef } from "react";
import "./HomeContent.css"
import { Link } from "react-router-dom"
import homeVideo from "../../../assets/home-background.mp4"
import PlayButton from "../../../assets/Pong_white.png"

export default function HomeContent() {

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const h1Ref = useRef<HTMLHeadingElement>(null);

    let interval = null;

    const onMouseOver = (event: React.MouseEvent<HTMLHeadingElement>) => {  
        let iteration = 0;

        clearInterval(interval);

        interval = setInterval(() => {
            if (!h1Ref.current) return;
            h1Ref.current.innerText = h1Ref.current.dataset.value
                .split("")
                .map((letter, index) => {
                    if(index < iteration) {
                        return h1Ref.current?.dataset.value[index];
                    }
                    return letters[Math.floor(Math.random() * 26)]
                })
                .join("");

            if(iteration >= h1Ref.current.dataset.value.length){ 
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);
    }

    return (
        <div className="HomeContent">
            <video src={homeVideo} autoPlay loop muted className="HomeContent-video"/>
            <div className="HomeContent-text">
                <h1
                    className="HomeContent-magic-text"
                    onMouseOver={onMouseOver}
                    data-value=" Jouer a Pong !"
                    ref={h1Ref}
                >
                    Jouer a Pong !
                </h1>
                <Link to="/lobby" style={{textDecoration: 'none', color: 'whitesmoke'}}>
                <div class="glitch">
                    <img src={PlayButton} alt="" />
	                <div class="glitch__layers">
		                <div class="glitch__layer"></div>
		                <div class="glitch__layer"></div>
		                <div class="glitch__layer"></div>
	                </div>
                </div>
                </Link>
            </div>
        </div>
    );
}