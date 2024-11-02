import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/Firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserPosts(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserPosts = async (userUid) => {
    try {
      const postsQuery = query(collection(db, 'posts'), where('uid', '==', userUid));
      const postsSnapshot = await getDocs(postsQuery);
      const postsList = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Fetched Posts:', postsList);
      setPosts(postsList);
      fetchCommentsForPosts(postsList);
    } catch (error) {
      setError('Error fetching posts: ' + error.message);
    }
  };

  const fetchCommentsForPosts = async (postsList) => {
    try {
      const commentsData = {};
      for (const post of postsList) {
        const commentsQuery = query(collection(db, 'comments'), where('postId', '==', post.id));
        const commentsSnapshot = await getDocs(commentsQuery);
        commentsData[post.id] = commentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }
      setComments(commentsData);
    } catch (error) {
      setError('Error fetching comments: ' + error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      setError('Error logging in: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setError('Error logging out: ' + error.message);
    }
  };

  return (
    <>
      <h2 style={{ textAlign: 'center', color: '#00aaff', marginBottom: '20px' }}>Login</h2>
      <center><h3 style={{ color: 'cornsilk',fontFamily:'fantasy' }}>CERTANO OVER UNCERTAINTY!</h3></center>
      <div style={{
          maxWidth: '800px',
          margin: '30px auto',
          padding: '30px',
          border: '1px solid #333',
          borderRadius: '15px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
          backgroundColor: '#1b1b1b',
          color: '#f0f0f0',
          transition: 'all 0.3s ease'
        }}>
        {user ? (
          <div className="profile-section" style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'white',fontFamily:'fantasy' }}>Welcome, {user.displayName || user.email}</h2>
            <img
              src={user.photoURL || 'https://via.placeholder.com/150'}
              alt="Profile"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                margin: '20px auto',
                border: '3px solid #ffcc00',
                transition: 'transform 0.3s',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)'
              }}
            />
            <p           style={{fontFamily:'sans-serif', color:'white'}}         >Email: <strong>{user.email}</strong></p>
            <p>User Id: <strong>{user.uid}</strong></p>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff4c4c',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'block',
                margin: '20px auto',
                fontSize: '16px',
                transition: 'transform 0.3s',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            >
              Logout
            </button>

            <div className="user-posts-section" style={{ marginTop: '30px' }}>
              <h3 style={{ color: '#00aaff' }}>Your Posts</h3>
              {posts.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: '0' }}>
                  {posts.map((post) => (
                    <li key={post.id} style={{
                      marginBottom: '20px',
                      padding: '15px',
                      backgroundColor: '#252525',
                      borderRadius: '10px',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
                    }}>
                      <h4 style={{ color: '#ffcc00' }}>{post.title}</h4>
                      <p style={{ color: '#ccc' }}>{post.description}</p>
                      <h5 style={{ color: '#00aaff' }}>Comments:</h5>
                      <ul style={{ listStyleType: 'none', padding: '0' }}>
                        {comments[post.id]?.length > 0 ? (
                          comments[post.id].map((comment) => (
                            <li key={comment.id} style={{ marginBottom: '10px' }}>
                              <p style={{ color: '#999' }}> Comment:  {comment.commentText}</p>
                              <small style={{ color: '#888' }}>By: {comment.commentBy}</small>
                            </li>
                          ))
                        ) : (
                          <p style={{ color: '#999' }}>No Comments</p>
                        )}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#999' }}>You haven't created any posts yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="login-form" style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#ffcc00' }}>Login</h2>
            {error && <p style={{ color: '#ff4c4c' }}>{error}</p>}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                style={{
                  padding: '12px',
                  marginBottom: '15px',
                  border: '1px solid #00aaff',
                  borderRadius: '5px',
                  fontSize: '16px',
                  backgroundColor: '#333',
                  color: '#f0f0f0',
                  transition: 'background 0.3s ease, border-color 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = '#252525';
                  e.target.style.borderColor = '#005f7f';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = '#333';
                  e.target.style.borderColor = '#00aaff';
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{
                  padding: '12px',
                  marginBottom: '20px',
                  border: '1px solid #00aaff',
                  borderRadius: '5px',
                  fontSize: '16px',
                  backgroundColor: '#333',
                  color: '#f0f0f0',
                  transition: 'background 0.3s ease, border-color 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = '#252525';
                  e.target.style.borderColor = '#005f7f';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = '#333';
                  e.target.style.borderColor = '#00aaff';
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 0',
                  backgroundColor: '#00aaff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'transform 0.3s ease',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Login
              </button>
            </form>
            <p style={{ marginTop: '15px', color: '#f0f0f0' }}>
              Don't have an account? <Link to="/signup" style={{ color: '#ffcc00' }}>Sign up</Link>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default LoginPage;
