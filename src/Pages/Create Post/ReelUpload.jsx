import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/Firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

const CLOUD_NAME = 'dzf155vhq';
const UPLOAD_PRESET = 'posts_certano';

const ReelUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log('User logged in:', currentUser.uid);
        setUser(currentUser);
      } else {
        console.log('No user logged in');
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile) return null;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Video upload failed');
      }
      
      const data = await response.json();
      setIsUploading(false);
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading video:', error);
      setError('Error uploading video: ' + error.message);
      setIsUploading(false);
      return null;
    }
  };

  const handleReelUpload = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to upload a reel.');
      return;
    }

    if (!title || !description || !videoFile) {
      setError('All fields are required');
      return;
    }

    try {
      // First upload the video to Cloudinary
      const uploadedVideoUrl = await handleVideoUpload();
      
      if (!uploadedVideoUrl) {
        setError('Video upload failed. Please try again.');
        return;
      }

      // Then save the reel data to Firestore
      const reelData = {
        title,
        description,
        video: uploadedVideoUrl,
        uid: user.uid,
        userName: user.displayName || 'Anonymous User',
        userPhoto: user.photoURL || '',
        createdAt: serverTimestamp(),
        likes: 0,
        likedUsers: [],
        comments: [],
        views: 0,
      };

      const docRef = await addDoc(collection(db, 'reels'), reelData);
      console.log('Reel uploaded with ID:', docRef.id);

      setTitle('');
      setDescription('');
      setVideoFile(null);
      setVideoUrl('');
      setError('');
      
      alert('Reel uploaded successfully!');
      
      // Navigate to the reels view page to see the uploaded reel
      navigate(`/reels/${docRef.id}`);
    } catch (error) {
      console.error('Error uploading reel:', error);
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
      opacity: isUploading ? 0.7 : 1,
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
    linkButton: {
      marginTop: '20px',
      color: '#BB86FC',
      textDecoration: 'none',
    }
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
          onChange={handleVideoChange}
          required
          style={styles.input}
        />
        {videoFile && (
          <div style={styles.videoPreview}>
            <p>Selected file: {videoFile.name}</p>
          </div>
        )}
        <button 
          type="submit" 
          disabled={!user || isUploading} 
          style={styles.button}
        >
          {isUploading ? 'Uploading...' : 'Upload Reel'}
        </button>
      </form>

      {!user && <p style={styles.error}>Please log in to upload a reel.</p>}
      
      <Link to="/reels" style={styles.linkButton}>View All Reels</Link>
    </div>
  );
};

export default ReelUpload;
