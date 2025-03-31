import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/Firebase';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';

const CLOUD_NAME = 'dzf155vhq';
const UPLOAD_PRESET = 'posts_certano';

const ReelUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log('User logged in:', currentUser.uid); // Debug log
        setUser(currentUser);
      } else {
        console.log('No user logged in'); // Debug log
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setVideoUrl(data.secure_url); // Get the uploaded video URL
      } catch (error) {
        setError('Error uploading video');
      }
    }
  };

  const handleReelUpload = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to upload a reel.');
      return;
    }

    if (!title || !description || !videoUrl) {
      setError('All fields are required');
      return;
    }

    try {
      await addDoc(collection(db, 'reels'), {
        title,
        description,
        video: videoUrl,
        uid: user.uid, // Correct user ID
        createdAt: new Date(),
        likes: 0, // Initial likes
        comments: [], // Initial empty comments
        views: 0, // Initial views
      });

      setTitle('');
      setDescription('');
      setVideoUrl('');
      setError('');
      alert('Reel uploaded successfully');
    } catch (error) {
      setError('Error uploading reel: ' + error.message);
    }
  };

  const styles = {
    container: {
      backgroundColor: '#121212',
      color: '#FFFFFF',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
    },
    form: {
      backgroundColor: '#1E1E1E',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
      width: '100%',
      maxWidth: '400px',
    },
    input: {
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      borderRadius: '5px',
      border: '1px solid #333',
      backgroundColor: '#2A2A2A',
      color: '#FFF',
    },
    button: {
      width: '100%',
      padding: '10px',
      marginTop: '10px',
      backgroundColor: '#6200EE',
      border: 'none',
      borderRadius: '5px',
      color: '#FFF',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    error: {
      color: 'red',
      marginBottom: '10px',
    },
    videoPreview: {
      marginTop: '10px',
      borderRadius: '10px',
      overflow: 'hidden',
    },
    heading: {
      marginBottom: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Upload a New Reel</h2>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleReelUpload} style={styles.form}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          style={styles.input}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
          style={styles.input}
        />
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          required
          style={styles.input}
        />
        {videoUrl && (
          <video controls width="100%" style={styles.videoPreview}>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        <button type="submit" disabled={!user} style={styles.button}>Upload Reel</button>
      </form>

      {!user && <p style={styles.error}>Please log in to upload a reel.</p>}
    </div>
  );
};

export default ReelUpload;
