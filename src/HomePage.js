import React, { useState, useEffect, useRef } from 'react';
import './Home.css';

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [loginTime, setLoginTime] = useState('');
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false); // Track background blur state
  const messageEndRef = useRef(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedLoginTime = localStorage.getItem('loginTime');

    if (storedUsername) {
      setUsername(storedUsername);
    }

    if (storedLoginTime) {
      setLoginTime(storedLoginTime);
    }
  }, []);

  const handleLogout = () => {
    // Show the logout success popup immediately
    setIsLoggedOut(true);
    setIsBlurred(true); // Apply the blur effect

    // Set a timeout to handle the redirect after 2 seconds
    setTimeout(() => {
      // Proceed with the API call in the background after the popup shows
      const logoutTime = new Date().toISOString();
      const logoutData = { username, logoutTime };

      fetch('http://localhost:3000/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logoutData),
      })
        .then(() => {
          console.log('Logout successful');
          console.log(`Logout Time: ${logoutTime}`);
          localStorage.removeItem('username');
          localStorage.removeItem('loginTime');
        })
        .catch((err) => console.error('Logout error:', err));

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000); // Delay the redirect by 2 seconds
    }, 0);
  };

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessages = [
        ...messages,
        { text: input, sender: 'user' },
      ];
      setMessages(newMessages);

      // Log the request body to verify what is being sent
      console.log('Sending message to API:', { message: input });

      try {
        const response = await fetch('https://flaskapi-k-ezf6ayhya6brbwhp.centralindia-01.azurewebsites.net/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: input }),  // Ensure this structure matches the API's expected format
        });

        // If the response is not ok, throw an error with the response status
        if (!response.ok) {
          const errorData = await response.json();  // Try to get error details from the response
          console.error('Error from API:', errorData);  // Log the error details from the API
          throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);  // Log the response for debugging

        setMessages([
          ...newMessages,
          { text: data.response, sender: 'bot' },
        ]);
      } catch (err) {
        console.error('Error fetching answer from API:', err);
        setMessages([
          ...newMessages,
          { text: 'Sorry, please ask about Kavach-related questions.', sender: 'bot' },
        ]);
      }

      setInput('');
      scrollToBottom();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputCaps = (e) => {
    let value = e.target.value;

    // Capitalize the first letter of the input (if there's at least one character)
    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setInput(value);
  };


  return (
    <>
      {/* Header with Kavach Guidelines Chatbot and logout button */}
      <header className="Homepageheader">
        <div className="chat-title">KAVACH GUIDELINES CHATBOT</div>
        {!isLoggedOut && (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </header>

      <div className={`chat-container ${isBlurred ? 'blurred' : ''}`}>
        {/* Heading inside the chat-container */}
        <div className="chat-header">
          <h1>How can I assist you?</h1>
        </div>

        <div className="chat-box">
          <div className="message-list">
            {messages.map((message, index) => (
              <div key={index} className={`message-bubble ${message.sender}`}>
                <div className={`message-icon ${message.sender}`}>
                  {message.sender === 'user' ? (
                    <i className="fas fa-question-circle"></i>
                  ) : (
                    <i className="fas fa-robot"></i>
                  )}
                </div>
                <div className={`message-content ${message.sender}`}>
                  <span>{message.text}</span>
                </div>
              </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>

          <div className="input-area">
            <div className="input-container">
              <input
                type="text"
                placeholder="Ask your question here"
                value={input}
                onChange={handleInputCaps}  // Updated to call handleInputChange
                onKeyDown={handleKeyPress}
                className="input-field"
              />
              <button onClick={handleSendMessage} className="send-button">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>

        </div>
      </div>

      {isLoggedOut && (
        <div className="logout-popup">
          <p>You have successfully logged out of your account, Thank you!</p>
        </div>
      )}
    </>
  );
};

export default Home;
