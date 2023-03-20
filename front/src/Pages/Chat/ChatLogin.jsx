// npx generate-react-cli component new


import React from "react";
//import { connect } from "react-redux";
//import ChatComponent from "./ChatComponent";

//import "./Home.css"

export default function ChatLogin() {

    return (
        <div class="container text-center" style={{
          backgroundColor: 'white',
          color: 'black'
        }}>
          <div class="row gx-5">
              <div class="col vh-100">ChatroomList
              <li >
                <button onClick={() => console.log("hihi")}>test</button>
              </li></div>
              <div class="col-6 vh-100">Message</div>
              <div class="col vh-100">ChatroomDetail</div>

          </div>
        </div>
    );
}