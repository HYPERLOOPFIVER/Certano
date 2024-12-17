import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/Firebase'; // Import db as 'db'

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
      // Step 1: Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Write user data to Firestore Users collection
      const userRef = doc(db, 'users', user.uid); // Reference to the user's document
      await setDoc(userRef, {
        name: name,
        email: email,
        userid: user.uid,
        followers: [], // Initialize an empty array for followers
      });

      alert('Signup successful');
      // Optionally redirect the user after signup
    } catch (err) {
      setError('Failed to sign up: ' + err.message);
    }
  };

  return (
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
        >
          Sign Up
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <p style={{ color: '#555' }}>Already have an account? <a href="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Login</a></p>
      </div>
    </div>
  );
};

export default Signup;
