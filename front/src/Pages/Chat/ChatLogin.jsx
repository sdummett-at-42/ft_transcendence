// npx generate-react-cli component new


import React from "react";
//import { connect } from "react-redux";
import ChatroomList from "./ChatroomList";

//import "./Home.css"

export default function ChatLogin() {

    return (
        <div className="container text-center" style={{
          backgroundColor: 'white',
          color: 'black'
        }}>
          <div className="row gx-5">
              <div className="col vh-100"><ChatroomList />
              <li >
                <button onClick={() => console.log("hihi")}>test</button>
              </li></div>
              <div className="col-6 vh-100">Message</div>
              <div className="col vh-100">ChatroomDetail</div>

          </div>
        </div>
    );
}