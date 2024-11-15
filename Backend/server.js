const express = require('express');
const mssql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');  // Import path module to resolve paths
require('dotenv').config();

const app = express();

// Middleware to enable CORS and parse JSON bodies
app.use(cors());
app.use(bodyParser.json());

// Database connection configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // Use encryption for security
    trustServerCertificate: true // Use this option for local dev
  }
};

// POST route for login
app.post('/login', async (req, res) => {
  const { username, loginTime } = req.body;

  try {
    await mssql.connect(dbConfig);

    // Insert login time into the database
    const result = await mssql.query`
      INSERT INTO UserLogins (Username, LoginTime) 
      VALUES (${username}, ${loginTime})
    `;

    res.status(200).send({ message: 'Login time saved successfully' });
  } catch (error) {
    console.error('Error saving login time:', error);
    res.status(500).send({ message: 'Failed to save login time' });
  } finally {
    await mssql.close();
  }
});

// POST route for logout
app.post('/logout', async (req, res) => {
  const { username, logoutTime } = req.body;

  try {
    await mssql.connect(dbConfig);

    // Use parameterized query to prevent SQL injection
    const result = await mssql.query`
      UPDATE UserLogins
      SET LogoutTime = ${logoutTime}
      WHERE Username = ${username} AND LogoutTime IS NULL
    `;

    res.status(200).send({ message: 'Logout time saved successfully' });
  } catch (error) {
    console.error('Error saving logout time:', error);
    res.status(500).send({ message: 'Failed to save logout time' });
  } finally {
    await mssql.close();
  }
});

// Serve static files from React app (build directory)
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// Handle any route by serving React's index.html file
// This is needed to support client-side routing in React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;  // Azure will set the PORT environment variable
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
