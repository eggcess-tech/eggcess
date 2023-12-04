import React from 'react';
import axios from 'axios';

function Login() {
  const handleTwitterLogin = async () => {
    try {
      const response = await axios.get('http://192.168.0.104:3001/auth/twitter');
      // Redirect to the Twitter login page or handle the response as needed.
    } catch (error) {
      console.error('Twitter login error:', error);
    }
  };

  return (
    <div>
      <button onClick={handleTwitterLogin}>Login with Twitter</button>
    </div>
  );
}

export default Login;
