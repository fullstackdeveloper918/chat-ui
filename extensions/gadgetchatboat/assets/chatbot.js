const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const sessionId = crypto.randomUUID();

let dynamicApiKey = null;

// Initial height for chat input
const inputInitHeight = chatInput.scrollHeight;

// Function to fetch the dynamic API key
const fetchDynamicApiKey = async () => {
  try {
    const response = await fetch('https://pf-swim-mortgages-accomplish.trycloudflare.com/api/getStore-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain: window.Shopify.shop }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 200 && data.data && data.data.length > 0) {
      dynamicApiKey = data.data[0].api_key;
      return dynamicApiKey;
      console.log("Fetched API Key:", dynamicApiKey);
    } else {
      console.error("No valid data found in the response.");
    }
  } catch (error) {
    console.error("Error fetching dynamic API key:", error);
  }
};

fetchDynamicApiKey();

const API_URL = "https://api.zoiya.io/shopify/messages/";

const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);
  let chatContent = className === "outgoing"
    ? `<p></p>`
    : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  console.log("Message:", message);
  return chatLi;
};


const generateResponse = async (chatElement) => {
  console.log("insert")
  fetchDynamicApiKey();
  console.log(dynamicApiKey)
  const messageElement = chatElement.querySelector("p");
  const userMessage = messageElement.textContent; 
const sessionIdw = sessionId;
const currentLanguage = Shopify.locale;
console.log("Current Store Language: ", currentLanguage);
if(currentLanguage == 'en'){
  langugae='En';
}
else if (currentLanguage == 'fr'){
  langugae='Fr';
}
else{
  langugae='En';
}
console.log("run" +langugae)
  const requestOptions = {
    method: "POST",
    headers: {
      "Authorization": dynamicApiKey,
      "Content-Type": "application/json", 
    },
    body: JSON.stringify({
      user_message: userMessage, 
      language: langugae, 
      session_id: sessionIdw, 
    }),
  };

  try {
    // Send POST request to the API
    const response = await fetch(API_URL, requestOptions);

    
    const data = await response.json();
    console.log(data)
    const assistantMessage = data.messages[0]?.message || "No response received.";
    console.log("Assistant Message:", assistantMessage);
    
    // Update the message element with the extracted message
    messageElement.textContent = assistantMessage;
  } catch (error) {
    messageElement.classList.add("error");
    messageElement.textContent = error.message;
    console.error("API Error:", error);
  } finally {
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }
};

console.log("Session ID:", sessionId);


const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;

  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
 
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 300);
}

chatInput.addEventListener("input", () => {
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {

  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => {

  document.body.classList.remove("show-chatbot")
}
);
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
