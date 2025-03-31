import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/Firebase';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from '../../firebase/Firebase';
import { Link, useNavigate } from 'react-router-dom';
import { FiImage, FiX, FiUpload, FiUser } from 'react-icons/fi';
import { MdOutlineSlowMotionVideo } from 'react-icons/md';

const CLOUD_NAME = 'dzf155vhq';
const UPLOAD_PRESET = 'posts_certano';

const PostUpload = () => {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    
    setIsUploading(true);
    setProgress(0);
    
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, true);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setImageUrl(data.secure_url);
          setIsUploading(false);
        } else {
          setError('Error uploading image');
          setIsUploading(false);
        }
      };
      
      xhr.send(formData);
    } catch (error) {
      setError('Error uploading image');
      setIsUploading(false);
    }
  };

  const handlePostUpload = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to create a post.');
      return;
    }

    if (!caption || !imageUrl) {
      setError('Caption and image are required');
      return;
    }

    try {
      const postRef = await addDoc(collection(db, 'posts'), {
        caption,
        image: imageUrl,
        uid: user.uid,
        username: user.displayName || user.email.split('@')[0],
        userPhoto: user.photoURL || '',
        likes: [],
        comments: [],
        createdAt: new Date(),
      });

      await updateDoc(doc(db, 'users', user.uid), {
        posts: arrayUnion(postRef.id),
      });

      // Reset form
      setCaption('');
      setImageFile(null);
      setImageUrl('');
      setPreviewUrl('');
      setError('');
      
      // Navigate to home after successful post
      navigate('/');
    } catch (error) {
      setError('Error uploading post: ' + error.message);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    setImageUrl('');
  };

  return (
    <div className="dark-upload-container">
      <div className="upload-header">
        <button onClick={() => navigate(-1)} className="back-button">
          &times;
        </button>
        <h2>New Post</h2>
        {imageUrl && (
          <button 
            onClick={handlePostUpload}
            className="share-button"
            disabled={isUploading}
          >
            {isUploading ? '...' : 'Share'}
          </button>
        )}
      </div>

      <div className="upload-content">
        {!previewUrl ? (
          <div className="upload-placeholder">
            <div className="upload-icon">
              <FiImage size={48} />
            </div>
            <p>Select photos to share</p>
            <label htmlFor="file-upload" className="file-upload-button">
              Select from gallery
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="mobile-upload-flow">
            <div className="image-preview-wrapper">
              <img src={previewUrl} alt="Preview" className="image-preview" />
              {isUploading && (
                <div className="upload-progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
            
            <div className="caption-section">
              <div className="user-info">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User" className="user-avatar" />
                ) : (
                  <div className="default-avatar">
                    <FiUser size={20} />
                  </div>
                )}
                <span>{user?.displayName || user?.email?.split('@')[0]}</span>
              </div>
              
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                className="caption-input"
                rows="3"
              />
              
              {!imageUrl && (
                <button 
                  onClick={handleImageUpload}
                  className="upload-button"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              )}
            </div>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
      </div>
      
      <style jsx>{`
        .dark-upload-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #121212;
          color: #e0e0e0;
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }
        
        .upload-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #333;
          position: sticky;
          top: 0;
          background-color: #121212;
          z-index: 10;
        }
        
        .back-button {
          background: none;
          border: none;
          color: #e0e0e0;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
        }
        
        .upload-header h2 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }
        
        .share-button {
          background: transparent;
          border: none;
          color: #0095f6;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          font-size: 16px;
        }
        
        .share-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .upload-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        
        .upload-placeholder {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
        }
        
        .upload-icon {
          margin-bottom: 20px;
          color: #666;
        }
        
        .upload-placeholder p {
          color: #e0e0e0;
          font-size: 18px;
          margin-bottom: 20px;
        }
        
        .file-upload-button {
          background: #0095f6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        }
        
        .mobile-upload-flow {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .image-preview-wrapper {
          position: relative;
          background: #000;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          max-height: 60vh;
        }
        
        .image-preview {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
        
        .caption-section {
          padding: 16px;
          border-top: 1px solid #333;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .user-avatar, .default-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          margin-right: 12px;
        }
        
        .user-avatar {
          object-fit: cover;
        }
        
        .default-avatar {
          background: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
        }
        
        .caption-input {
          width: 100%;
          background: transparent;
          border: none;
          resize: none;
          font-size: 14px;
          color: #e0e0e0;
          padding: 8px 0;
          margin-bottom: 16px;
        }
        
        .caption-input:focus {
          outline: none;
        }
        
        .caption-input::placeholder {
          color: #666;
        }
        
        .upload-button {
          width: 100%;
          background: #0095f6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 12px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        }
        
        .upload-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .upload-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .progress-bar {
          height: 100%;
          background: #0095f6;
          transition: width 0.3s ease;
        }
        
        .error-message {
          color: #ed4956;
          text-align: center;
          padding: 16px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default PostUpload;