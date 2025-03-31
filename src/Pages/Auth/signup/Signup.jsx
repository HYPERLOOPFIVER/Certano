import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/Firebase';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        followers: [],
        following: [],
        posts: [],
        reels: [],
        createdAt: new Date(),
      });

      alert('Signup successful');
      navigate('/login');
    } catch (err) {
      setError('Failed to sign up: ' + err.message);
    }
  };

  return (
    <div style={{
      backgroundColor: '#000',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #FF9933, #FFFFFF, #138808)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 5px rgba(0,0,0,0.2)',
            marginBottom: '10px'
          }}>CERTANO</h1>
          <h2 style={{
            fontSize: '24px',
            color: '#e0e0e0',
            marginBottom: '0'
          }}>India's First Social Media</h2>
          <p style={{
            fontSize: '18px',
            color: '#ff9933',
            fontWeight: 'bold',
            marginTop: '10px'
          }}>CERTANO OVER UNCERTAINTY!</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(40,40,40,0.9) 0%, rgba(20,20,20,0.9) 100%)',
          borderRadius: '20px',
          boxShadow: '0 15px 30px rgba(0,0,0,0.6), 0 0 20px rgba(255,153,51,0.2), 0 0 20px rgba(19,136,8,0.2)',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '30px',
          backdropFilter: 'blur(10px)',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '28px',
              marginBottom: '30px',
              color: '#fff',
              textShadow: '0 2px 5px rgba(0,0,0,0.3)'
            }}>
              <span style={{ color: '#FF9933' }}>Join </span>
              <span style={{ color: '#FFFFFF' }}>the </span>
              <span style={{ color: '#138808' }}>Revolution</span>
            </h2>

            {error && (
              <div style={{
                padding: '10px 15px',
                backgroundColor: 'rgba(255,76,76,0.2)',
                border: '1px solid rgba(255,76,76,0.5)',
                borderRadius: '8px',
                marginBottom: '20px',
                color: '#ff4c4c',
                fontSize: '14px',
                textAlign: 'left'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '16px',
                  color: '#ccc'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: 'rgba(30,30,30,0.6)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '16px',
                    transition: 'all 0.3s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff9933';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255,153,51,0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '16px',
                  color: '#ccc'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: 'rgba(30,30,30,0.6)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '16px',
                    transition: 'all 0.3s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff9933';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255,153,51,0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '16px',
                  color: '#ccc'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: 'rgba(30,30,30,0.6)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '16px',
                    transition: 'all 0.3s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff9933';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255,153,51,0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '16px',
                  color: '#ccc'
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: 'rgba(30,30,30,0.6)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '16px',
                    transition: 'all 0.3s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff9933';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255,153,51,0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '15px',
                  background: 'linear-gradient(to right, #138808, #0D6B06)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(19,136,8,0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(19,136,8,0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(19,136,8,0.3)';
                }}
              >
                Create Account
              </button>
            </form>

            <p style={{
              marginTop: '30px',
              color: '#ccc',
              fontSize: '16px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '20px'
            }}>
              Already have an account?{' '}
              <Link to="/login" style={{
                color: '#ff9933',
                fontWeight: 'bold',
                textDecoration: 'none',
                transition: 'all 0.3s'
              }}>
                Login
              </Link>
            </p>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          color: '#666',
          fontSize: '14px'
        }}>
          <p>By signing up, you agree to Certano's Terms of Service and Privacy Policy</p>
          <p>&copy; 2025 Certano - India's First Social Media Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;