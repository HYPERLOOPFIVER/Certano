import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/Firebase'; // Import Firestore and auth instances
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore'; // Correct Firestore imports
import { onAuthStateChanged } from '../../firebase/Firebase'; // Listen to authentication state changes
import { Link } from 'react-router-dom';

// Cloudinary setup
const CLOUD_NAME = 'dzf155vhq';
const UPLOAD_PRESET = 'posts_certano';

const PostUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('cloud_name', CLOUD_NAME);

      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setImageUrl(data.secure_url); // Get the uploaded image URL
      } catch (error) {
        setError('Error uploading image');
      }
    }
  };

  const handlePostUpload = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to create a post.');
      return;
    }

    if (!title || !description || !imageUrl) {
      setError('All fields are required');
      return;
    }

    try {
      // Create a new post in the 'posts' collection
      const postRef = await addDoc(collection(db, 'posts'), {
        title,
        description,
        image: imageUrl,
        uid: user.uid,
        createdAt: new Date(),
      });

      // Now, update the user's document to include the new post's ID using arrayUnion
      const userRef = doc(db, 'users', user.uid); // Get reference to user's document
      await updateDoc(userRef, {
        posts: arrayUnion(postRef.id), // Add post ID to user's posts array
      });

      setTitle(''); // Clear title input
      setDescription(''); // Clear description input
      setImageUrl(''); // Clear image URL
      setError(''); // Clear error
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
              }}
            />
            <input
              type="file"
              onChange={handleImageUpload}
              required
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#f9f9f9',
              }}
            />
            {imageUrl && <img src={imageUrl} alt="Uploaded" style={{ width: '100%', marginBottom: '15px' }} />}
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
              }}
              disabled={!user}
            >
              Post
            </button>
          </form>
          
          {!user && <p style={{ color: 'red' }}>Please log in to create a post.</p>}
        </div>
      </center>

      <center>
        <Link
          to={'/Reelupload'}
          style={{
            display: 'inline-block',
            padding: '12px 20px',
            backgroundColor: 'black',
            color: 'black',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            textAlign: 'center',
            marginTop: '20px',
            textDecoration: 'none',
          }}
        >
          Post Reel
        </Link>
      </center>
    </>
  );
};

export default PostUpload;
