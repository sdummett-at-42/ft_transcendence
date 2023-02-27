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