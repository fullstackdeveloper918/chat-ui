import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const apiUrl =  'http://demo.zoiya.io/api/';

const Chatbot = ({ sessionId, demoType, customerId }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false); // State to track assistant response loading
  const messageListRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const response = await axios.post(`${apiUrl}demo/chatbot/messages/`, {
        session_id: sessionId,
        demo_type: demoType,
        customer_id: customerId
      });

      const fetchedMessages = response.data.messages;

      console.log(fetchedMessages);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch all messages (or initialize with the first message if no messages exist)
  useEffect(() => {
    fetchMessages();
  }, [sessionId]);

  // Send a message (user input or button click) to the server
  const sendMessage = async (messageContent) => {
    if (messageContent.trim()) {
      const userMessage = {
        message: messageContent,
        sender: 'user',
      };
      setInputValue('');
      setMessages([...messages, userMessage]);

      // Set loading state to true before making the API call
      setLoading(true);

      try {
        const response = await axios.post(`${apiUrl}demo/chatbot/`, {
          message: messageContent,
          session_id: sessionId,
          demo_type: demoType,
          customer_id: customerId,
        });

        fetchMessages()
        // const botReply = response.data.reply;

        // // Ensure choices and products are arrays
        // const botMessage = {
        //   message: botReply.prompt,
        //   sender: 'assistant',
        //   products: Array.isArray(botReply.products) ? botReply.products : [],
        //   choices: Array.isArray(botReply.choices) ? botReply.choices : [],
        // };

        // // Update the messages with the assistant's reply
        // setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        // Turn off the loading state after the assistant's response is received
        setLoading(false);
      }
    }
  };

  // Handle key press to send message when Enter is pressed
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
    //   sendMessage(inputValue);
      setInputValue(''); // Clear input field after sending message
    }
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle button click to send the button value as a message
  const handleButtonClick = (buttonValue) => {
    sendMessage(buttonValue); 
  };

  const handleAddCart = (buttonValue) => {
    console.log(buttonValue)
  };


  return (
    <div className="chatbot-container">

      <div className="chatbox">
        <div className='zoiya-header'>
          <svg width="101" height="25" viewBox="0 0 101 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 24.3565L4.31161 24.3386L19.3295 24.2238L19.3708 19.9289H5.64005C11.7798 15.6792 10.9979 12.3677 14.6673 8.52728C15.7501 7.39239 17.2201 6.21515 19.3718 4.95138L19.3305 0.625449L0 0.648971V5.0803L11.8248 5.01067C11.507 5.3165 11.1741 5.64963 10.8357 6.01101C10.832 6.01471 10.832 6.01759 10.8292 6.01759C6.81288 10.288 1.35938 18.3291 0 20.1792" fill="#B21CFF" />
            <path d="M54.4496 0.609392V24.3714H49.088V0.609392H54.4496Z" fill="#B21CFF" />
            <path d="M63.2782 0.609392L68.7438 11.7221L74.2096 0.609392H80.2668L68.5695 24.3714H62.5122L65.7148 17.8718L57.22 0.609392H63.2782Z" fill="#B21CFF" />
            <path d="M89.5109 0.609524L101 24.3716H95.0813C94.594 23.4277 93.4803 22.0999 91.7392 22.0999C89.0227 22.0999 86.1334 24.9306 81.8165 24.9306C77.4992 24.9306 74.6801 20.5275 78.9617 12.2454L84.9842 0.608587H89.5092L89.5109 0.609524ZM91.7047 17.3477L87.248 8.19242L84.6031 13.434C83.2449 16.1244 81.2952 20.1783 83.8022 20.1783C85.8214 20.1783 88.8153 17.6968 91.7047 17.3477Z" fill="#B21CFF" />
            <path d="M33.0941 20.5123C33.1776 20.5227 33.2563 20.5331 33.3397 20.5396C33.4363 20.55 33.5338 20.5566 33.6266 20.5641C33.4541 20.5576 33.2769 20.5396 33.0941 20.5123ZM32.8935 20.4879C32.9629 20.4983 33.0285 20.5086 33.0941 20.5123C32.6863 20.4531 32.2916 20.3599 31.9044 20.231C32.2438 20.3487 32.5756 20.4361 32.8935 20.4879ZM33.0941 20.5123C33.1776 20.5227 33.2563 20.5331 33.3397 20.5396C33.4363 20.55 33.5338 20.5566 33.6266 20.5641C33.4541 20.5576 33.2769 20.5396 33.0941 20.5123ZM32.8935 20.4879C32.9629 20.4983 33.0285 20.5086 33.0941 20.5123C32.6863 20.4531 32.2916 20.3599 31.9044 20.231C32.2438 20.3487 32.5756 20.4361 32.8935 20.4879ZM33.0941 20.5123C33.1776 20.5227 33.2563 20.5331 33.3397 20.5396C33.4363 20.55 33.5338 20.5566 33.6266 20.5641C33.4541 20.5576 33.2769 20.5396 33.0941 20.5123ZM32.8935 20.4879C32.9629 20.4983 33.0285 20.5086 33.0941 20.5123C32.6863 20.4531 32.2916 20.3599 31.9044 20.231C32.2438 20.3487 32.5756 20.4361 32.8935 20.4879Z" fill="#B21CFF" />
            <path d="M30.1597 0.357354C22.955 1.96652 18.8561 8.25359 20.4143 15.2784C21.9715 22.3032 28.34 26.2518 35.5448 24.6427C42.7496 23.0335 46.8483 16.7464 45.2902 9.72162C43.733 2.69677 37.3645 -1.25182 30.1597 0.357354ZM36.6267 19.1865C36.2095 19.7991 35.3788 20.2405 34.34 20.4296C34.1695 20.4607 33.9941 20.4823 33.8085 20.4946C33.7438 20.5058 33.6772 20.5096 33.6079 20.5143C33.2863 20.5331 32.9432 20.5209 32.5869 20.4795C32.5119 20.4748 32.435 20.4673 32.3573 20.4522C32.2738 20.4428 32.1894 20.4296 32.105 20.4165C30.3425 20.1238 28.3963 19.2251 27.126 18.0498C26.8944 17.8352 26.6928 17.6169 26.5212 17.3985C26.749 17.3722 26.976 17.3393 27.2009 17.2997C28.3053 17.1172 29.3403 16.8001 30.3566 16.4914L30.4532 16.4632C31.8313 16.0454 32.9685 15.7273 34.0672 15.7094C35.2232 15.6962 36.3651 16.3089 36.8433 17.2019C37.1779 17.8314 37.1086 18.4798 36.6276 19.1847L36.6267 19.1865ZM40.0327 14.4917C38.6985 12.6454 36.4242 11.5133 34.011 11.5472C32.241 11.5688 30.5835 12.0713 29.2531 12.4788L29.1538 12.508C27.9125 12.8853 26.7406 13.243 25.6175 13.2909C25.6072 13.1969 25.6015 13.1037 25.5875 13.0096C25.0662 9.72064 27.0678 5.17733 31.3213 4.50826C35.5185 3.84859 38.9798 6.36865 39.9857 10.9063C40.2567 12.1259 40.2585 13.3493 40.0327 14.4917Z" fill="#B21CFF" />
          </svg>

        </div>
        <ul id="message-list" ref={messageListRef}>
          {messages.map((message, index) => (
            <li key={index} className="message">
              {message.sender === 'assistant' && (
                <div className="avatar-container">
                  <div className="avatar avatar-assistant">A</div>
                </div>
              )}
              <div className="message-inner-container">
                <div
                  className={`message-content ${message.sender === 'user' ? 'message-user-content' : 'message-assistant-content'}`}
                >
                  {message.message}
                </div>

                {/* Render button options only if it's the last message and choices are available */}
                {index === messages.length - 1 && Array.isArray(message.choices) && message.choices.length > 0 && (
                  <div className="choices-container">
                    {message.choices.map((choice, idx) => (
                      <button
                        key={idx}
                        className="button-option"
                        onClick={() => handleButtonClick(choice)}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                )}

                {/* Render product cards if products are available */}
                {message.products && message.products.length > 0 && (
                  <div className="products-container">
                    {message.products.map((product, index) => (
                      <div key={index} className="product-card">
                        <img
                          src={product.img}
                          alt={product.title}
                          className="product-image"
                        />
                        <div className="product-details">
                          <h4>{product.title}</h4>
                          <p>Price: ${product.price}</p>
                          <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="product-link"
                          >
                            View
                          </a>
                          <button className="add-to-cart-button" onClick={() => handleAddCart(product)}>
                            <AddShoppingCartIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
          {loading && (
            <li className="message">
              <div className={'avatar avatar-assistant'}>A</div>
              <div className="message-content loading-message">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </li>
          )}
        </ul>

        <div className="input-container">
          <input
            type="text"
            id="message-input"
            placeholder="Message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button id="send-button" 
          onClick={() => sendMessage(inputValue)}
            >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.2667 10.5048L15.0417 7.2465C14.9642 7.16839 14.872 7.1064 14.7705 7.06409C14.6689 7.02178 14.56 7 14.45 7C14.34 7 14.2311 7.02178 14.1295 7.06409C14.028 7.1064 13.9358 7.16839 13.8583 7.2465C13.7031 7.40263 13.616 7.61384 13.616 7.834C13.616 8.05415 13.7031 8.26536 13.8583 8.4215L16.825 11.4132H6.83333C6.61232 11.4132 6.40036 11.501 6.24408 11.6572C6.0878 11.8135 6 12.0255 6 12.2465C6 12.4675 6.0878 12.6795 6.24408 12.8358C6.40036 12.992 6.61232 13.0798 6.83333 13.0798H16.875L13.8583 16.0882C13.7802 16.1656 13.7182 16.2578 13.6759 16.3594C13.6336 16.4609 13.6118 16.5698 13.6118 16.6798C13.6118 16.7898 13.6336 16.8988 13.6759 17.0003C13.7182 17.1019 13.7802 17.194 13.8583 17.2715C13.9358 17.3496 14.028 17.4116 14.1295 17.4539C14.2311 17.4962 14.34 17.518 14.45 17.518C14.56 17.518 14.6689 17.4962 14.7705 17.4539C14.872 17.4116 14.9642 17.3496 15.0417 17.2715L18.2667 14.0382C18.7348 13.5694 18.9978 12.934 18.9978 12.2715C18.9978 11.609 18.7348 10.9736 18.2667 10.5048Z" fill="#AD49E1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
