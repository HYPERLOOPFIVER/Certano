import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/Firebase'; // Import db as 'db'
import { useNavigate } from 'react-router-dom'; // For navigation

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize navigation

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Step 1: Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Write user data to Firestore Users collection
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        name: name,
        email: email,
        userid: user.uid,
        followers: [], // Initialize an empty array for followers
        following: [], // Initialize an empty array for following
        posts: [], // Initialize empty posts
        reels: [], // Initialize empty reels
        createdAt: new Date(), // Add timestamp
      });

      alert('Signup successful');
      navigate('/login'); // Redirect to login or dashboard after signup
    } catch (err) {
      setError('Failed to sign up: ' + err.message);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#1e1e1e',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '24px',
      }}>Sign Up</h2>
      {error && <p style={{
        color: 'red',
        textAlign: 'center',
        marginBottom: '15px',
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
            borderRadius: '5px',
            fontSize: '16px',
          }}
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
            borderRadius: '5px',
            fontSize: '16px',
          }}
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
            borderRadius: '5px',
            fontSize: '16px',
          }}
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
            borderRadius: '5px',
            fontSize: '16px',
          }}
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
          }}
        >
          Sign Up
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <p>Already have an account? <a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Login</a></p>
      </div>
    </div>
  );
};

export default Signup;
