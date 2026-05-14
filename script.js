
const chatButton = document.getElementById("chatButton");
const chatPopup = document.getElementById("chatPopup");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatBody = document.getElementById("chatBody");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const authPopup = document.getElementById("authPopup");

const authMessage = document.getElementById("authMessage");
const modeSelect = document.getElementById("modeSelect");

const imageInput = document.getElementById("imageInput");
const fileInput = document.getElementById("fileInput");
const menuBtn = document.getElementById("menuBtn");

const menuPopup = document.getElementById("menuPopup");

const imageOption =
document.getElementById("imageOption");

const fileOption =
document.getElementById("fileOption");

const modeOption =
document.getElementById("modeOption");

const clearOption =
document.getElementById("clearOption");

const logoutOption =
document.getElementById("logoutOption");

imageOption.onclick = () => {

  imageInput.click();
  menuPopup.style.display = "none";

};
fileOption.onclick = () => {

  fileInput.click();

  menuPopup.style.display = "none";

};

clearOption.onclick = () => {

  localStorage.removeItem("chatHistory");

  localStorage.removeItem("conversationHistory");

  chatBody.innerHTML = `
    <div class="bot-message">
      Chat cleared 👋
    </div>
  `;

conversationHistory = [systemPrompt];
selectedImage = null;

  menuPopup.style.display = "none";

};

logoutOption.onclick = () => {

  localStorage.removeItem("loggedInUser");

  localStorage.removeItem("chatHistory");

  localStorage.removeItem("conversationHistory");

  usernameInput.value = "";

  passwordInput.value = "";

  authMessage.innerText = "";

  authPopup.style.display = "flex";

  chatPopup.style.display = "none";

  chatButton.style.display = "none";

  menuPopup.style.display = "none";

};
modeOption.onclick = () => {

  if(modeSelect.style.display === "block"){

    modeSelect.style.display = "none";

  }

  else{

    modeSelect.style.display = "block";

  }

};

let systemPrompt = {
  role: "system",
  content: "You are a helpful AI assistant. You remember previous conversations, names, preferences and personal details shared by the user during this session."
};

let conversationHistory = [systemPrompt];
let selectedImage = null;
modeSelect.onchange = () => {

  const mode = modeSelect.value;

  if(mode === "coder"){

    systemPrompt.content =
    "You are a professional coding assistant.";

  }

  else if(mode === "teacher"){

    systemPrompt.content =
    "You are a helpful teacher who explains simply.";

  }

  else if(mode === "funny"){

    systemPrompt.content =
    "You are a funny and entertaining AI.";

  }

  else if(mode === "interview"){

    systemPrompt.content =
    "You are an interview coach helping with job interviews.";

  }

  else{

    systemPrompt.content =
    "You are a helpful AI assistant.";

  }

  conversationHistory[0] = systemPrompt;

};

// OPEN CHAT
chatButton.onclick = () => {

  authPopup.style.display = "none";

  if(chatPopup.style.display === "flex"){

    chatPopup.style.display = "none";

  }

  else{

    chatPopup.style.display = "flex";

  }

};


signupBtn.onclick = async () => {

  const username = usernameInput.value;

  const password = passwordInput.value;
if(!username || !password){

  authMessage.innerText =
  "Please fill all fields";

  return;

}
  const response = await fetch(
    "http://127.0.0.1:8000/signup",
    {
      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        username,
        password
      })
    }
  );

  const data = await response.json();

  authMessage.innerText = data.message;

};
loginBtn.onclick = async () => {

  const username = usernameInput.value;

  const password = passwordInput.value;
if(!username || !password){

  authMessage.innerText =
  "Please fill all fields";

  return;

}
  const response = await fetch(
    "http://127.0.0.1:8000/login",
    {
      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        username,
        password
      })
    }
  );

  const data = await response.json();

  authMessage.innerText = data.message;

  if(data.message === "Login successful"){

    localStorage.setItem("loggedInUser", username);

    authPopup.style.display = "none";

    chatButton.style.display = "flex";
    chatPopup.style.display = "flex";

  }

};


// AI FUNCTION
async function getAIResponse(message) {

  try {

    const response = await fetch(
      "http://127.0.0.1:8000/chat",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

       body: JSON.stringify({
  messages: conversationHistory.slice(-6)
})
      }
    );

    const data = await response.json();

    return data.reply;

  }
  catch(error) {

    console.log(error);

    return "Something went wrong";

  }

}

function speakText(text){

  if(!("speechSynthesis" in window)){
    console.log("Speech not supported");
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance();

  speech.text = text;

  speech.lang = "en-US";

  speech.volume = 1;

  speech.rate = 1;

  speech.pitch = 1;

  speech.onerror = (e) => {
    console.log("Speech error:", e);
  };

  window.speechSynthesis.speak(speech);

}
// SEND MESSAGE
sendBtn.onclick = async () => {

  const message = userInput.value;

if(
  message.trim() === "" &&
  !selectedImage
) return;

  // USER MESSAGE
  const userMessage = document.createElement("div");

  userMessage.classList.add("user-message");

  userMessage.innerText = message;

  chatBody.appendChild(userMessage);

  // save user message in memory
if(selectedImage){

  conversationHistory.push({
    role:"user",
    content:[
      {
        type:"text",
        text:message
      },
      {
        type:"image_url",
        image_url:{
          url:selectedImage
        }
      }
    ]
  });

}

else{

  conversationHistory.push({
    role:"user",
    content: message
  });

}

  userInput.value = "";
  userInput.focus();


  // BOT MESSAGE
  const botMessage = document.createElement("div");

botMessage.classList.add("bot-message", "loading-message");
  botMessage.innerHTML = `
<span class="dot"></span>
<span class="dot"></span>
<span class="dot"></span>
`;

  chatBody.appendChild(botMessage);

  chatBody.scrollTo({
  top: chatBody.scrollHeight,
});
const aiReply = await getAIResponse(message);
console.log(aiReply);

// AI REPLY
botMessage.innerHTML = "";

botMessage.classList.add("typing-message");

if(!aiReply){
  botMessage.innerText = "No response";
  return;
}
botMessage.textContent = aiReply;
if(aiReply){
  // SAVE AI REPLY IN MEMORY

  conversationHistory.push({
    role: "assistant",
    content: aiReply
  });
  selectedImage = null;

}



// saving chat on local storage of browser 
localStorage.setItem("chatHistory", chatBody.innerHTML);

localStorage.setItem(
  "conversationHistory",
  JSON.stringify(conversationHistory)
);

speakText(aiReply);
 chatBody.scrollTop = chatBody.scrollHeight;

};




// ENTER KEY
userInput.addEventListener("keypress", function(event) {

  if (event.key === "Enter") {
    sendBtn.click();
  }

});

function sendSuggestion(text){

if(recognition){
  recognition.stop();
}
  userInput.value = text;

  sendBtn.click();

}
// theme button code 
const themeBtn = document.getElementById("themeBtn");

themeBtn.onclick = () => {
  chatPopup.classList.toggle("dark");
};

// add image code 
imageInput.onchange = () => {

  const file = imageInput.files[0];

  if(!file) return;

  const reader = new FileReader();

  reader.onload = function(e){

    const img = new Image();

    img.src = e.target.result;

    img.onload = function(){

      const canvas =
      document.createElement("canvas");

      const ctx =
      canvas.getContext("2d");

      const maxWidth = 600;

      const scale =
      maxWidth / img.width;

      canvas.width = maxWidth;

      canvas.height =
      img.height * scale;

      ctx.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );

      selectedImage =
      canvas.toDataURL(
        "image/jpeg",
        0.5
      );

      const preview =
      document.createElement("img");

      preview.src = selectedImage;

      preview.classList.add("chat-image");

      chatBody.appendChild(preview);

const tempMessage =
document.createElement("div");

tempMessage.classList.add("bot-message");

tempMessage.innerText =
"Image uploaded successfully ✅ Vision analysis depends on model availability.";

chatBody.appendChild(tempMessage);

chatBody.scrollTop =
chatBody.scrollHeight;

    };

  };

  reader.readAsDataURL(file);

};

// add file code 
fileInput.onchange = () => {

  const file = fileInput.files[0];

  if(!file) return;

  const fileMessage =
  document.createElement("div");

  fileMessage.classList.add("bot-message");

  fileMessage.innerHTML = `
    📄 File uploaded:<br>
    <strong>${file.name}</strong>
  `;

  chatBody.appendChild(fileMessage);
  const infoMessage =
document.createElement("div");

infoMessage.classList.add("bot-message");

infoMessage.innerText =
"📚 File uploaded successfully. AI file analysis feature coming soon 🚀";

chatBody.appendChild(infoMessage);

  chatBody.scrollTop =
  chatBody.scrollHeight;

};
const micBtn = document.getElementById("micBtn");

let recognition = null;

if(
  window.SpeechRecognition ||
  window.webkitSpeechRecognition
){

  recognition = new (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition
  )();

  
  recognition.lang = "en-US";

}


micBtn.onclick = () => {

  try{

    if(recognition){
      recognition.start();
    }

  }
  catch(error){
    console.log(error);
  }

};

if(recognition){

  recognition.onresult = function(event){

    const transcript =
    event.results[0][0].transcript;

    userInput.value = transcript;

    sendBtn.click();

  };

}


// LOAD SAVED CHAT HISTORY WHEN PAGE OPENS
async function loadChatHistory() {

  try {

    const savedConversation = localStorage.getItem("conversationHistory");

    if(savedConversation){

      conversationHistory = JSON.parse(savedConversation);

    }

    const savedChat = localStorage.getItem("chatHistory");

    if(savedChat){

      chatBody.innerHTML = savedChat;

    }

  }

  catch(error){

    console.log(error);

  }

}

loadChatHistory();

const savedUser = localStorage.getItem("loggedInUser");

if(savedUser){

  authPopup.style.display = "none";

chatButton.style.display = "flex";
chatPopup.style.display = "flex";
}


// menu button code 
menuBtn.onclick = () => {

  if(menuPopup.style.display === "flex"){

    menuPopup.style.display = "none";

  }

  else{

    menuPopup.style.display = "flex";

  }

};