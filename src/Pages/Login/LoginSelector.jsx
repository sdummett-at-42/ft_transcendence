import React from "react";
import "./LoginSelector.css"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCoffee } from "@fortawesome/free-solid-svg-icons"

export default function LoginSelector() {

    // const subtitle = document.getElementsByClassName("card-subtitle")[0];
    // const belowButton = document.getElementsByClassName("card-subtitle")[2];
    // // const linkAccount = document.getElementsByClassName("card-subtitle")[3];

    // const createWord = (text, index) => {
    //     const word = document.createElement("span");
  
    //     word.innerHTML = `${text} `;
  
    //     word.classList.add("card-subtitle-word");
  
    //     word.style.transitionDelay = `${index * 40}ms`;
  
    //     return word;
    // }

    // const addWord = (text, index) => subtitle.appendChild(createWord(text, index));
    // const addBelow = (text, index) => belowButton.appendChild(createWord(text, index));
    // // const addAccount = (text, index) => linkAccount.appendChild(createWord(text, index));

    // const createSubtitle = text => text.split(" ").map(addWord);
    // const createBelowButton = text => text.split(" ").map(addBelow)
    // // const createAccountMsg = text => text.split(" ").map(addAccount);

    // createSubtitle("Choose your sign-in method :");
    // createBelowButton("No account ?");
    // // createAccountMsg("Create an account");

    return (
        <div className="body">
            <div className="card">
        <div className="card-content">

            <img className="invert-effect" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/1200px-42_Logo.svg.png" alt="Logo-ecole-42" />
            <h3 className="card-title">Transcendence</h3>

            <h4 className="card-subtitle" id="subtitle"></h4>

            <div className="card-subtitle">
                  
                <Link className="button" to="/login/auth42" >
                    <div className="button-content">
                        <div className="button-image">
                            <FontAwesomeIcon icon={faCoffee} />
                        </div>
                        <div className="button-text">Intra 42</div>
                    </div>
                </Link>
                
                <Link className="button" to="/login/google">
                    <div className="button-content">
                        <div className="button-image">
                        {/* <FontAwesomeIcon icon="fa-solid fa-user" /> */}
                        </div>
                        <div className="button-text">Google</div>
                    </div>
                </Link>
            
                <Link className="button" to="/login/transcendence">
                    <div className="button-content">
                        <div className="button-image">
                            {/* <i className="fa-solid fa-question"></i> */}
                        </div>
                        <div className="button-text">Other</div>
                    </div>
                </Link>
    
            </div>

            <Link>
            <h4 className="card-subtitle"></h4>
            {/* <a href="#" className="card-subtitle"></a> */}
            </Link>

        </div>
    </div>
        </div>
    );
}