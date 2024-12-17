import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/Firebase'; // Import Firestore and auth instances
import { collection, addDoc } from 'firebase/firestore'; // Correct Firestore imports
import { onAuthStateChanged } from '../../firebase/Firebase'; // Listen to authentication state changes
import { Link } from 'react-router-dom';

const PostUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null); // Store the logged-in user

  // Listen for authentication state changes to check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the logged-in user
      } else {
        setUser(null); // No user is logged in
      }
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  const handlePostUpload = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to create a post.');
      return;
    }

    if (!title || !description || !image) {
      setError('All fields are required');
      return;
    }

    try {
      // Add a new document to the "posts" collection
      await addDoc(collection(db, 'posts'), {
        title,
        description,
        image,
        uid: user.uid,  // Get user ID from the logged-in user
        createdAt: new Date(),
      });

      // Clear the form fields after successful post upload
      setTitle('');
      setDescription('');
      setImage('');
      setError('');  // Clear any previous errors
      alert('Post uploaded successfully');
    } catch (error) {
      setError('Error uploading post: ' + error.message);
    }
  };

  return (
    <>
      <center>
        <div style={{
          backgroundColor: 'white',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '20px',
          width: '90%',
          maxWidth: '600px',
          marginTop: '50px',
        }}>
          <h2 style={{
            fontSize: '24px',
            color: '#333',
            marginBottom: '20px',
          }}>Create a New Post</h2>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <form onSubmit={handlePostUpload}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#f9f9f9',
                transition: 'border 0.3s ease-in-out',
              }}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              required
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#f9f9f9',
                transition: 'border 0.3s ease-in-out',
              }}
            />
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Image URL"
              required
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#f9f9f9',
                transition: 'border 0.3s ease-in-out',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease-in-out',
              }}
              disabled={!user} // Disable button if user is not logged in
            >
              Post
            </button>
          </form>
          
          {!user && <p style={{ color: 'red' }}>Please log in to create a post.</p>}
        </div>
      </center>

      <center>
        <Link
          to={'/PostIdea'}
          style={{
            display: 'inline-block',
            padding: '12px 20px',
            backgroundColor: 'white',
            color: 'black',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            textAlign: 'center',
            marginTop: '20px',
            textDecoration: 'none',
            transition: 'background-color 0.3s ease-in-out',
          }}
        >
          Post Idea
        </Link>
      </center>
    </>
  );
};

export default PostUpload;
