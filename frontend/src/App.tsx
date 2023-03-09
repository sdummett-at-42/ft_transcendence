import React from "react";
import ReactDOM from 'react-dom/client';
import './App.css';

function Login() {
    return (
        <div className="card">
            <div className="card-content">

                <img className="invert-effect" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/1200px-42_Logo.svg.png" alt="Logo-ecole-42" style="width:15vmin;height:15vmin;"/>
                <h3 className="card-title">Transcendence</h3>

                <h4 className="card-subtitle" id="subtitle"></h4>

                <div className="card-subtitle">
                  
                    <div className="button" id="intra-42" >
                        <div className="button-content">
                            <div className="button-image">
                                <a href="#">
                                    <i className="fa-solid fa-user"></i>
                                </a>
                            </div>
                            <div className="button-text">Intra 42</div>
                        </div>
                    </div>
                
                    <div className="button" id="google">
                        <div className="button-content">
                            <div className="button-image">
                                <a href="#">
                                    <i className="fa-brands fa-google"></i>
                                </a>
                            </div>
                            <div className="button-text">Google</div>
                        </div>
                    </div>
            
                    <div className="button" id="other">
                        <div className="button-content">
                            <div className="button-image">
                                <a href="#">
                                    <i className="fa-solid fa-question"></i>
                                </a>
                            </div>
                            <div className="button-text">Other</div>
                        </div>
                    </div>
    
                </div>

                <h4 className="card-subtitle"></h4>
                <a href="#" className="card-subtitle"></a>

            </div>
        </div>
    );
};

export default App;