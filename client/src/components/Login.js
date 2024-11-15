import React, { useState } from 'react';
import Cookies from 'js-cookie'; // Import js-cookie
import logo from '../assets/logo.jpg';
import backgroundImage from '../assets/background.jpg';
import { useSnackbar } from 'notistack';
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const {enqueueSnackbar} = useSnackbar();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:3300/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // Store the token in cookies and show success message
        Cookies.set('token', result.token, { expires: 1 / 24 });
        enqueueSnackbar('Login Successful!', { variant: 'success' });
        setTimeout(() => {
          window.location.href = '/'; // Redirect after success message
        }, 1500); // Delay redirection to allow time for Snackbar display
      } else {
        enqueueSnackbar(result.message || 'Login Failed', { variant: 'error' });
      }
    } catch (err) {
      console.error('Error during login:', err);
      enqueueSnackbar('Failed to log in', { variant: 'error' });
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen bg-gray-900">
      <img
        src={backgroundImage}
        alt="Background"
        className="absolute inset-0 object-cover w-full h-full"
      />
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 w-full max-w-md p-8 space-y-4 bg-black bg-opacity-40 rounded-lg shadow-md">
        <div className="flex justify-center mb-4">
          <img className="w-22 h-10" src={logo} alt="logo" />
        </div>
        <h1 className="text-xl font-bold text-center text-white">Login</h1>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="username" className="block mb-2 text-sm font-bold text-white">
              Admin Name
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 focus:ring-primary-600 focus:border-primary-600"
              placeholder="enter name"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-bold text-white">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full p-2 border border-gray-300 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 focus:ring-primary-600 focus:border-primary-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full text-white font-bold bg-gray-900 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Submit
          </button>
          {error && (
            <p className="text-sm font-light text-red-500 text-center">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
