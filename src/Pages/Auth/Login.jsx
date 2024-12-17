import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/Firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
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
        const commentsForPost = commentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        commentsData[post.id] = commentsForPost;
      }
      setComments(commentsData);
    } catch (error) {
      setError('Error fetching comments: ' + error.message);
    }
  };

  const deletePost = async (postId) => {
    try {
      const postDoc = doc(db, 'posts', postId);
      await deleteDoc(postDoc);
      // Remove the post from the state
      setPosts(posts.filter((post) => post.id !== postId));
      // Optionally, remove the comments as well if desired
      const updatedComments = { ...comments };
      delete updatedComments[postId];
      setComments(updatedComments);
    } catch (error) {
      setError('Error deleting post: ' + error.message);
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

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError('Error logging in with Google: ' + error.message);
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
      <h2 style={{ textAlign: 'center', color: '#0056b3', marginBottom: '20px' }}>Login</h2>
      <center><h3 style={{ color: '#333', fontFamily: 'fantasy' }}>CERTANO OVER UNCERTAINTY!</h3></center>
      <div style={{
        maxWidth: '800px',
        margin: '30px auto',
        padding: '30px',
        border: '1px solid #ddd',
        borderRadius: '15px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff',
        color: '#333',
        transition: 'all 0.3s ease'
      }}>
        {user ? (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#333', fontFamily: 'fantasy' }}>Welcome, {user.displayName || user.email}</h2>
            <img
              src={user.photoURL || 'https://via.placeholder.com/150'}
              alt="Profile"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                margin: '20px auto',
                border: '3px solid #007bff',
                transition: 'transform 0.3s',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
            />
            <p style={{ fontFamily: 'sans-serif', color: '#333' }}>Email: <strong>{user.email}</strong></p>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff4c4c',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'transform 0.3s',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                margin: '20px auto',
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

            <div>
              <h3>Your Posts</h3>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} style={{ marginBottom: '20px' }}>
                    <h4>{post.title}</h4>
                    <p>{post.content}</p>
                    <button
                      onClick={() => deletePost(post.id)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#ff4c4c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginTop: '10px',
                        transition: 'transform 0.3s',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      Delete Post
                    </button>
                    <h5>Comments:</h5>
                    {comments[post.id] && comments[post.id].length > 0 ? (
                      comments[post.id].map((comment) => (
                        <p key={comment.id}><strong>{comment.userName}</strong>: {comment.text}</p>
                      ))
                    ) : (
                      <p>No comments yet.</p>
                    )}
                  </div>
                ))
              ) : (
                <p>No posts found.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="login-form" style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#007bff' }}>Login</h2>
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
                  border: '1px solid #007bff',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9',
                  color: '#333',
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
                  border: '1px solid #007bff',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9',
                  color: '#333',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 0',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'transform 0.3s',
                }}
              >
                Login
              </button>
            </form>
            <button
              onClick={handleGoogleLogin}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                backgroundColor: '#4285F4',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                marginTop: '20px',
                transition: 'background 0.3s, transform 0.3s',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#357ae8';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#4285F4';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Login with Google
            </button>
            <p style={{ marginTop: '20px', color: '#333' }}>
              Don't have an account? <Link to="/signup" style={{ color: '#007bff' }}>Sign up</Link>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default LoginPage;
