const subtitle = document.getElementsByClassName("card-subtitle")[0];
const belowButton = document.getElementsByClassName("card-subtitle")[2];
const linkAccount = document.getElementsByClassName("card-subtitle")[3];

const createWord = (text, index) => {
  const word = document.createElement("span");
  
  word.innerHTML = `${text} `;
  
  word.classList.add("card-subtitle-word");
  
  word.style.transitionDelay = `${index * 40}ms`;
  
  return word;
}

const addWord = (text, index) => subtitle.appendChild(createWord(text, index));
const addBelow = (text, index) => belowButton.appendChild(createWord(text, index));
const addAccount = (text, index) => linkAccount.appendChild(createWord(text, index));

const createSubtitle = text => text.split(" ").map(addWord);
const createBelowButton = text => text.split(" ").map(addBelow)
const createAccountMsg = text => text.split(" ").map(addAccount);

createSubtitle("Choose your sign-in method :");
createBelowButton("No account ?");
createAccountMsg("Create an account");

// function TextHover (props) {

//     return (
//     <span className="card-subtitle-word"
//           // style={{ 'transitionDelay' : `${index * 40}ms` }}
//           >
//       {props.text}
//     </span>
//     );
// }


// ReactDOM.render(<TextHover text="Choose your sign-in method :"/>, document.querySelector("#subtitle"));

function Login_select() {
  return (
    <div class="card">
      <div class="card-content">

        <img src={ require("https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/1200px-42_Logo.svg.png")} class="invert-effect" alt="Logo-ecole-42" style="width:15vmin;height:15vmin;"/>
        <h3 class="card-title">Transcendence</h3>

        <h4 class="card-subtitle" id="subtitle"></h4>

        <div class="card-subtitle">
              
            <div class="button" id="intra-42" >
                <div class="button-content">
                    <div class="button-image">
                        <a href="#">
                            <i class="fa-solid fa-user"></i>
                        </a>
                    </div>
                    <div class="button-text">Intra 42</div>
                </div>
            </div>
            
            <div class="button" id="google">
                <div class="button-content">
                    <div class="button-image">
                        <a href="#">
                            <i class="fa-brands fa-google"></i>
                        </a>
                    </div>
                    <div class="button-text">Google</div>
                </div>
            </div>
        
            <div class="button" id="other">
                <div class="button-content">
                    <div class="button-image">
                        <a href="#">
                            <i class="fa-solid fa-question"></i>
                        </a>
                    </div>
                    <div class="button-text">Other</div>
                </div>
            </div>

        </div>

        <h4 class="card-subtitle"></h4>
        <a href="#" class="card-subtitle"></a>

    </div>
  </div>
  );
}
