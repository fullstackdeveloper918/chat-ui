const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const sessionId = crypto.randomUUID();

console.log("domain"+ window.Shopify.shop)
let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;
fetch('https://reported-impose-twins-shopping.trycloudflare.com/api/getStore-info', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    domain: window.Shopify.shop
  })
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Successfully fetched the API key
    if (data.status === 200 && data.data && data.data.length > 0) {
      dynamicApiKey = data.data[0].api_key; // Access the first item in the array and get the api_key
      console.log("Fetched API Key:", dynamicApiKey);
     
    } else {
      console.error("No valid data found in the response.");
    }
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });


// const API_KEY = dynamicApiKey; // Your API key here
const API_URL = `https://api.zoiya.io/shopify/messages/`;

const createChatLi = (message, className) => {
  // Create a chat <li> element with passed message and className
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  console.log( message)
  return chatLi; // return chat <li> element
}
console.log(sessionId)
const generateResponse = async (chatElement) => {
  const messageElement = chatElement.querySelector("p");

  const requestOptions = {
    method: "POST",
    headers: { 
      "Authorization": `Api-Key ${dynamicApiKey}`, // Replace this with the actual bearer token
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ 
      "user_message": userMessage, 
      "language": "EN", 
      "session_id": sessionId 
    }),
  };

  // Send POST request to API, get response and set the response as paragraph text
  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Get the API response text and update the message element
    messageElement.textContent = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
  } catch (error) {
    // Handle error
    messageElement.classList.add("error");
    messageElement.textContent = error.message;
  } finally {
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }
};



const handleChat = () => {
  userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
  if (!userMessage) return;

  // Clear the input textarea and set its height to default
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  // Append the user's message to the chatbox
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    // Display "Thinking..." message while waiting for the response
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
}

chatInput.addEventListener("input", () => {
  // Adjust the height of the input textarea based on its content
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // If Enter key is pressed without Shift key and the window 
  // width is greater than 800px, handle the chat
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => {

  document.body.classList.remove("show-chatbot")
}
// alert('close')
);
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
// const chatbotToggler = document.querySelector(".chatbot-toggler");
// const closeBtn = document.querySelector(".close-btn");
// const chatbox = document.querySelector(".chatbox");
// const chatInput = document.querySelector(".chat-input textarea");
// const sendChatBtn = document.querySelector(".chat-input span");
// const sessionId = crypto.randomUUID();

// console.log("domain: " + window.Shopify.shop);
// let userMessage = null; // Variable to store user's message
// const inputInitHeight = chatInput.scrollHeight;
// let dynamicApiKey = null; // Declare variable for dynamic API key

// Fetch the API key dynamically based on the shop domain
// fetch('https://reported-impose-twins-shopping.trycloudflare.com/api/getStore-info', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json'
//   },
//   body: JSON.stringify({
//     domain: window.Shopify.shop // Using the Shopify domain dynamically
//   })
// })
//   .then(response => {
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     return response.json();
//   })
//   .then(data => {
//     // Successfully fetched the API key
//     if (data.status === 200 && data.data && data.data.length > 0) {
//       dynamicApiKey = data.data[0].api_key; // Access the first item in the array and get the api_key
//       console.log("Fetched API Key:", dynamicApiKey);
//       generateResponse(); // Call generateResponse after API key is fetched
//     } else {
//       console.error("No valid data found in the response.");
//     }
//   })
//   .catch(error => {
//     console.error("Error fetching data:", error);
//   });

// // API URL (use dynamic API key once it's fetched)
// const API_URL = `https://api.zoiya.io/shopify/messages/`;

// const createChatLi = (message, className) => {
//   // Create a chat <li> element with passed message and className
//   const chatLi = document.createElement("li");
//   chatLi.classList.add("chat", `${className}`);
//   let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
//   chatLi.innerHTML = chatContent;
//   chatLi.querySelector("p").textContent = message;
//   console.log(message);
//   return chatLi; // return chat <li> element
// };

// const generateResponse = async () => {
//   if (!dynamicApiKey) {
//     console.error("API key not available yet.");
//     return;
//   }

//   const requestOptions = {
//     method: "POST",
//     headers: {
//       "Authorization": `Api-Key ${dynamicApiKey}`, // Use the dynamically fetched API key
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       "user_message": userMessage,
//       "language": "EN",
//       "session_id": sessionId
//     }),
//   };

//   // Send POST request to API, get response and set the response as paragraph text
//   try {
//     const response = await fetch(API_URL, requestOptions);
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error.message);

//     // Get the API response text and update the message element
//     const messageElement = createChatLi("Thinking...", "incoming");
//     chatbox.appendChild(messageElement);
//     messageElement.querySelector("p").textContent = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
//     chatbox.scrollTo(0, chatbox.scrollHeight);
//   } catch (error) {
//     // Handle error
//     const messageElement = createChatLi("Error: " + error.message, "incoming");
//     chatbox.appendChild(messageElement);
//     messageElement.querySelector("p").textContent = error.message;
//   } finally {
//     chatbox.scrollTo(0, chatbox.scrollHeight);
//   }
// };

// const handleChat = () => {
//   userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
//   if (!userMessage) return;

//   // Clear the input textarea and set its height to default
//   chatInput.value = "";
//   chatInput.style.height = `${inputInitHeight}px`;

//   // Append the user's message to the chatbox
//   chatbox.appendChild(createChatLi(userMessage, "outgoing"));
//   chatbox.scrollTo(0, chatbox.scrollHeight);

//   setTimeout(() => {
//     // Display "Thinking..." message while waiting for the response
//     const incomingChatLi = createChatLi("Thinking...", "incoming");
//     chatbox.appendChild(incomingChatLi);
//     chatbox.scrollTo(0, chatbox.scrollHeight);
//     generateResponse(); // Now generate the response after the message is added
//   }, 600);
// };

// chatInput.addEventListener("input", () => {
//   // Adjust the height of the input textarea based on its content
//   chatInput.style.height = `${inputInitHeight}px`;
//   chatInput.style.height = `${chatInput.scrollHeight}px`;
// });

// chatInput.addEventListener("keydown", (e) => {
//   // If Enter key is pressed without Shift key and the window 
//   // width is greater than 800px, handle the chat
//   if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
//     e.preventDefault();
//     handleChat();
//   }
// });

// sendChatBtn.addEventListener("click", handleChat);
// closeBtn.addEventListener("click", () => {
//   document.body.classList.remove("show-chatbot");
// });
// chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
