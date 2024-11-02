// src/components/Signup.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '../../../firebase/Firebase';  // Import Firebase auth

const Signup = () => {
  const [name, setName] = useState('');  // State for name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');  // Clear error message

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Signup successful');
      // Optionally redirect the user after signup
    } catch (err) {
      setError('Failed to sign up: ' + err.message);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymously(auth);
      alert('Signed in anonymously');
      // Optionally redirect the user after anonymous sign-in
    } catch (err) {
      setError('Failed to sign in anonymously: ' + err.message);
    }
  };

  return (
    <>
      <h2>Signup</h2>
      <center><h3
      style={{
  fontFamily:'fantasy'
      }}
      >"Certainty Begins Here: Certano for Entrepreneurs."</h3></center>
      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        padding: '30px',
        border: '1px solid ,Red',
        borderRadius: '10px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'black',
        transition: 'all 0.3s ease'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '20px',
          color: '#333',
          fontFamily: 'Arial, sans-serif',
          fontSize: '24px',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
        }}>Sign Up</h2>
        {error && <p style={{
          color: 'red',
          textAlign: 'center',
          marginBottom: '15px',
          fontSize: '14px',
        }}>{error}</p>}
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column' }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            style={{
              marginBottom: '15px',
              padding: '12px',
              border: '1px solid #007bff',
              borderRadius: '5px',
              fontSize: '16px',
              transition: 'border 0.3s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0056b3'}
            onBlur={(e) => e.target.style.borderColor = '#007bff'}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={{
              marginBottom: '15px',
              padding: '12px',
              border: '1px solid #007bff',
              borderRadius: '5px',
              fontSize: '16px',
              transition: 'border 0.3s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0056b3'}
            onBlur={(e) => e.target.style.borderColor = '#007bff'}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={{
              marginBottom: '15px',
              padding: '12px',
              border: '1px solid #007bff',
              borderRadius: '5px',
              fontSize: '16px',
              transition: 'border 0.3s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0056b3'}
            onBlur={(e) => e.target.style.borderColor = '#007bff'}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
            style={{
              marginBottom: '20px',
              padding: '12px',
              border: '1px solid #007bff',
              borderRadius: '5px',
              fontSize: '16px',
              transition: 'border 0.3s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0056b3'}
            onBlur={(e) => e.target.style.borderColor = '#007bff'}
          />
          <button
            type="submit"
            style={{
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '18px',
              transition: 'background-color 0.3s',
              boxShadow: '0 2px 5px rgba(0, 123, 255, 0.2)',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Sign Up
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          
        </div>
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <p style={{ color: '#555' }}>Already have an account? <a href="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Login</a></p>
        </div>
      </div>
    </>
  );
};

export default Signup;
