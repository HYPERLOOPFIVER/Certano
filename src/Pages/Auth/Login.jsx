import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/Firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
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
      setPosts(posts.filter((post) => post.id !== postId));
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setError('Error logging out: ' + error.message);
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
          backdropFilter: 'blur(10px)'
        }}>
          {user ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                padding: '20px',
                borderRadius: '15px',
                background: 'linear-gradient(145deg, rgba(50,50,50,0.8), rgba(30,30,30,0.8))',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  color: '#ff9933',
                  fontSize: '28px',
                  marginBottom: '20px'
                }}>नमस्ते, {user.displayName || user.email.split('@')[0]}</h2>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  background: 'linear-gradient(145deg, #ff9933, #138808)',
                  padding: '5px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <img
                    src={user.photoURL || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    style={{
                      width: '110px',
                      height: '110px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #000'
                    }}
                  />
                </div>
                <p style={{
                  fontSize: '16px',
                  color: '#e0e0e0',
                  marginBottom: '20px'
                }}>Email: <span style={{ color: '#fff', fontWeight: 'bold' }}>{user.email}</span></p>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '12px 30px',
                    background: 'linear-gradient(145deg, #ff4c4c, #cc0000)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '30px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(255,76,76,0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 10px 20px rgba(255,76,76,0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(255,76,76,0.3)';
                  }}
                >
                  Logout
                </button>
              </div>

              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '30px'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  color: '#138808',
                  marginBottom: '20px',
                  textAlign: 'left',
                  borderLeft: '4px solid #ff9933',
                  paddingLeft: '15px'
                }}>Your Posts</h3>
                
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div key={post.id} style={{
                      background: 'rgba(30,30,30,0.7)',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '20px',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                      borderLeft: '3px solid #ff9933'
                    }}>
                      <h4 style={{
                        fontSize: '20px',
                        color: '#fff',
                        marginBottom: '10px'
                      }}>{post.title}</h4>
                      <p style={{
                        fontSize: '16px',
                        color: '#ccc',
                        marginBottom: '20px',
                        lineHeight: '1.6'
                      }}>{post.content}</p>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '15px'
                      }}>
                        <button
                          onClick={() => deletePost(post.id)}
                          style={{
                            padding: '8px 20px',
                            backgroundColor: 'rgba(255,76,76,0.2)',
                            color: '#ff4c4c',
                            border: '1px solid #ff4c4c',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.3s',
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = 'rgba(255,76,76,0.4)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'rgba(255,76,76,0.2)';
                          }}
                        >
                          Delete Post
                        </button>
                        
                        <div style={{
                          fontSize: '14px',
                          color: '#999'
                        }}>
                          {post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString() : 'Date unavailable'}
                        </div>
                      </div>
                      
                      <div style={{
                        marginTop: '20px',
                        borderTop: '1px dashed rgba(255,255,255,0.1)',
                        paddingTop: '15px'
                      }}>
                        <h5 style={{
                          fontSize: '16px',
                          color: '#138808',
                          marginBottom: '10px'
                        }}>Comments:</h5>
                        
                        {comments[post.id] && comments[post.id].length > 0 ? (
                          comments[post.id].map((comment) => (
                            <div key={comment.id} style={{
                              padding: '10px 15px',
                              backgroundColor: 'rgba(255,255,255,0.03)',
                              borderRadius: '8px',
                              marginBottom: '10px'
                            }}>
                              <p style={{ margin: '0' }}>
                                <strong style={{ color: '#ff9933' }}>{comment.userName}</strong>{': '}
                                <span style={{ color: '#ddd' }}>{comment.text}</span>
                              </p>
                            </div>
                          ))
                        ) : (
                          <p style={{ color: '#888', fontStyle: 'italic' }}>No comments yet.</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    backgroundColor: 'rgba(30,30,30,0.7)',
                    borderRadius: '10px'
                  }}>
                    <p style={{ color: '#aaa', fontSize: '18px' }}>No posts found. Create your first post to get started!</p>
                    <Link to="/create-post" style={{
                      display: 'inline-block',
                      marginTop: '20px',
                      padding: '10px 25px',
                      background: 'linear-gradient(145deg, #ff9933, #f57c00)',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: '25px',
                      fontWeight: 'bold',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 15px rgba(255,153,51,0.3)'
                    }}>Create Post</Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                maxWidth: '400px',
                margin: '0 auto',
                position: 'relative'
              }}>
                <h2 style={{
                  fontSize: '28px',
                  marginBottom: '30px',
                  color: '#fff',
                  textShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }}>
                  <span style={{ color: '#FF9933' }}>Log</span>
                  <span style={{ color: '#FFFFFF' }}>in to </span>
                  <span style={{ color: '#138808' }}>Certano</span>
                </h2>

                {error && (
                  <div style={{
                    padding: '10px 15px',
                    backgroundColor: 'rgba(255,76,76,0.2)',
                    border: '1px solid rgba(255,76,76,0.5)',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    color: '#ff4c4c',
                    fontSize: '14px'
                  }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '16px',
                      color: '#ccc'
                    }}>
                      Email
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

                  <div style={{ marginBottom: '30px' }}>
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
                      placeholder="Enter your password"
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
                      background: 'linear-gradient(to right, #FF9933, #F57C00)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '30px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 15px rgba(255,153,51,0.3)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(255,153,51,0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(255,153,51,0.3)';
                    }}
                  >
                    Login
                  </button>
                </form>

                <p style={{
                  marginTop: '30px',
                  color: '#ccc',
                  fontSize: '16px',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: '20px'
                }}>
                  Don't have an account?{' '}
                  <Link to="/signup" style={{
                    color: '#138808',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    transition: 'all 0.3s'
                  }}>
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          color: '#666',
          fontSize: '14px'
        }}>
          <p>&copy; 2025 Certano - India's First Social Media Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;