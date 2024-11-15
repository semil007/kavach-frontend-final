import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './images/sample-11.jpg'; // Your background image
import logo from './images/logo.jpg.png'; // Your logo
import './LoginPage.css'; // Your styles

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [loginTime, setLoginTime] = useState(null); // State to store login time
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (username && loginTime) {
        const logoutTime = new Date().toISOString(); // Capture logout time when closing the tab

        const logoutData = {
          username,
          logoutTime: logoutTime,
        };

        // Use sendBeacon instead of fetch for asynchronous data submission
        const url = 'http://localhost:3000/logout';

        // Send logout data asynchronously using sendBeacon
        const isSent = navigator.sendBeacon(url, JSON.stringify(logoutData));
        if (!isSent) {
          console.error("Failed to send logout data.");
        } else {
          console.error("Failed to send logout data via sendBeacon.");
        }
      }
    };

    // Attach the event listener for beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup the event listener when component is unmounted
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [username, loginTime]);



  const handleLogin = (e) => {
    e.preventDefault();

    console.log('Login attempted with the following details:');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);

    if (username === 'admin' && password === 'Kavach2024') {
      const currentLoginTime = new Date().toISOString(); // Capture current login time
      setLoginTime(currentLoginTime); // Update the login time state


      // Store the username and login time in localStorage
      localStorage.setItem('username', username);
      localStorage.setItem('loginTime', currentLoginTime);
      // Send login time to the backend
      const loginData = {
        username,
        loginTime: currentLoginTime,
      };

      fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })
        .then(() => {
          console.log('Login successful!');
          navigate('/home'); // Redirect after successful login
        })
        .catch((err) => {
          console.error('Error sending login data:', err);
        });
    } else {
      alert('Invalid credentials!');
      console.log('Invalid credentials entered!');
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle password visibility
  };

  return (
    <div className="login-page">
      <header className="header">
        <div className="brand-name">KAVACH CHATBOT</div>
        <span className="powered-by">Powered By</span>
        <img src={logo} alt="Logo" className="logo" />
      </header>
      <div className="background-image" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="login-box">
          <h2>Welcome Back</h2>
          <p className="login-subheading">Please enter your credentials to access your account</p>
          <form onSubmit={handleLogin}>
            <div className="textbox">
              <i className="fas fa-user" aria-hidden="true" style={{ color: 'black', left: '13px', top: '18px' }}></i>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="textbox">
              <i className="fas fa-lock" aria-hidden="true" style={{ color: 'black', left: '13px', top: '18px' }}></i>
              <input
                type={showPassword ? 'text' : 'password'} // Toggle between text and password
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="password-input"
              />
              {/* Eye icon to toggle password visibility */}
              <i
                className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'} password-eye-icon`}
                onClick={togglePasswordVisibility} // Toggle the eye icon on click
              ></i>
            </div>
            <div className="remember-me">
              <input type="checkbox" id="remember-me" />
              <label htmlFor="remember-me">Remember Me</label>
            </div>
            <button type="submit" className="btn">Login</button>
            {/* <div className="forgot-password">
              <a href="#">Forgot Password?</a>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
