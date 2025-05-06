import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase/Firebase';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  increment, 
  arrayUnion, 
  arrayRemove,
  query,
  orderBy,
  limit 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FaHeart, FaCommentAlt, FaShare, FaVolumeMute, FaVolumeUp, FaArrowLeft } from 'react-icons/fa';
import '../Create Post/ReelsDisiplay.css';

const ReelsDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [commentPopup, setCommentPopup] = useState(false);
  const [muted, setMuted] = useState(true); // Default to muted
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const reelContainerRef = useRef(null);
  const videoRef = useRef(null);

  // Check for authenticated user
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

  // Fetch all reels - simplified and more robust approach
  useEffect(() => {
    const fetchReels = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching all reels...');
        
        // Get all reels ordered by creation date without any conditions
        const reelsQuery = query(
          collection(db, 'reels'),
          orderBy('createdAt', 'desc'),
          limit(50) // Increased limit to ensure we get more reels
        );
        
        const reelsSnapshot = await getDocs(reelsQuery);
        let reelsList = reelsSnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data(),
          // Convert Firestore timestamp to JS Date for sorting
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        
        console.log(`Fetched ${reelsList.length} reels`);
        
        // Ensure we have proper defaults for fields
        reelsList = reelsList.map(reel => ({
          ...reel,
          likes: reel.likes || 0,
          comments: reel.comments || [],
          likedUsers: reel.likedUsers || [],
          views: reel.views || 0
        }));
        
        // Set all fetched reels to state
        setReels(reelsList);
        
        // If we have a specific reel ID, find its index
        if (id) {
          const reelIndex = reelsList.findIndex((reel) => reel.id === id);
          if (reelIndex >= 0) {
            setCurrentReelIndex(reelIndex);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching reels:', err);
        setError('Failed to load reels. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchReels();
  }, []); // Remove id dependency to prevent re-fetching when id changes
  
  // Update URL to reflect current reel ID for sharing/bookmarking
  useEffect(() => {
    if (reels.length === 0 || isLoading) return;
    
    const currentReel = reels[currentReelIndex];
    if (!currentReel) return;
    
    // Update URL without re-rendering
    window.history.replaceState(null, '', `/reels/${currentReel.id}`);
  }, [currentReelIndex, reels, isLoading]);

  // Update view count when a reel is viewed
  useEffect(() => {
    const updateViewCount = async () => {
      if (reels.length === 0 || isLoading) return;
      
      const currentReel = reels[currentReelIndex];
      if (!currentReel) return;
      
      try {
        const reelDocRef = doc(db, 'reels', currentReel.id);
        await updateDoc(reelDocRef, {
          views: increment(1)
        });
        
        // Update local state
        setReels(prevReels => {
          const updatedReels = [...prevReels];
          updatedReels[currentReelIndex] = {
            ...currentReel,
            views: (currentReel.views || 0) + 1
          };
          return updatedReels;
        });
      } catch (err) {
        console.error('Error updating view count:', err);
      }
    };
    
    updateViewCount();
  }, [currentReelIndex, reels, isLoading]);

  // Play the video when the current reel changes
  useEffect(() => {
    if (reels.length === 0 || isLoading) return;
    
    const currentReel = reels[currentReelIndex];
    if (!currentReel) return;
    
    console.log('Playing reel:', currentReel.id);
    
    // Stop all videos first
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(video => {
      video.pause();
    });
    
    // Play only the current video
    const videoElement = document.getElementById(`video-${currentReel.id}`);
    if (videoElement) {
      videoRef.current = videoElement;
      videoElement.currentTime = 0;
      videoElement.muted = muted;
      
      // Wait a brief moment to ensure video is ready
      setTimeout(() => {
        const playPromise = videoElement.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing video:', error);
            // Try playing again after a moment
            setTimeout(() => {
              videoElement.play().catch(e => console.error('Second play attempt failed:', e));
            }, 500);
          });
        }
      }, 100);
    }
  }, [currentReelIndex, reels, isLoading, muted]);

  // Handle swipe gestures (up/down)
  useEffect(() => {
    const handleWheel = (e) => {
      if (reels.length <= 1) return;
      
      if (e.deltaY > 0) {
        // Swipe down: go to the next reel
        if (currentReelIndex < reels.length - 1) {
          setCurrentReelIndex(prev => prev + 1);
        }
      } else if (e.deltaY < 0) {
        // Swipe up: go to the previous reel
        if (currentReelIndex > 0) {
          setCurrentReelIndex(prev => prev - 1);
        }
      }
    };

    const container = reelContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel);
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [currentReelIndex, reels.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' && currentReelIndex < reels.length - 1) {
        setCurrentReelIndex(prev => prev + 1);
      } else if (e.key === 'ArrowUp' && currentReelIndex > 0) {
        setCurrentReelIndex(prev => prev - 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentReelIndex, reels.length]);

  // Handle like functionality
  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like reels');
      return;
    }
    
    const currentReel = reels[currentReelIndex];
    if (!currentReel) return;

    const userId = user.uid;
    const hasLiked = currentReel.likedUsers?.includes(userId);

    try {
      const reelDocRef = doc(db, 'reels', currentReel.id);

      // Update the Firestore document
      await updateDoc(reelDocRef, {
        likes: increment(hasLiked ? -1 : 1),
        likedUsers: hasLiked ? arrayRemove(userId) : arrayUnion(userId),
      });

      // Update the local state
      setReels(prevReels => {
        const updatedReels = [...prevReels];
        updatedReels[currentReelIndex] = {
          ...currentReel,
          likes: currentReel.likes + (hasLiked ? -1 : 1),
          likedUsers: hasLiked
            ? currentReel.likedUsers.filter(uid => uid !== userId)
            : [...(currentReel.likedUsers || []), userId],
        };
        return updatedReels;
      });
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!user) {
      alert('Please log in to comment');
      return;
    }
    
    const currentReel = reels[currentReelIndex];
    if (!newComment.trim() || !currentReel) return;
    
    const commentData = {
      text: newComment.trim(),
      userId: user.uid,
      userName: user.displayName || 'Anonymous User',
      userPhoto: user.photoURL || '',
      timestamp: new Date()
    };
    
    try {
      const reelDocRef = doc(db, 'reels', currentReel.id);
      await updateDoc(reelDocRef, {
        comments: arrayUnion(commentData),
      });
      
      setReels(prevReels => {
        const updatedReels = [...prevReels];
        updatedReels[currentReelIndex] = {
          ...currentReel,
          comments: [...(currentReel.comments || []), commentData],
        };
        return updatedReels;
      });
      
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Toggle mute/unmute for the video
  const toggleMute = () => {
    setMuted(prev => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !muted;
    }
  };

  // Go back to previous page
  const goBack = () => {
    navigate(-1);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading reels...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Render empty state
  if (reels.length === 0) {
    return (
      <div className="no-reels-container">
        <p>No reels found.</p>
        <button onClick={() => navigate('/reels/upload')}>Upload a Reel</button>
      </div>
    );
  }

  const currentReel = reels[currentReelIndex];
  if (!currentReel) {
    return <div className="error-container">Reel not found</div>;
  }

  // Check if the current user has liked this reel
  const isLiked = user && currentReel.likedUsers?.includes(user.uid);

  return (
    <div className="reel-container" ref={reelContainerRef}>
      <div className="reel-header">
        <button className="back-button" onClick={goBack}>
          <FaArrowLeft />
        </button>
        <h2>Reels</h2>
      </div>
      
      <div className="reel-item">
        <video
          id={`video-${currentReel.id}`}
          src={currentReel.videoUrl}
          playsInline
          muted={muted}
          loop
          className="reel-video"
        />
        
        <div className="reel-actions">
          <button onClick={handleLike} className={`reel-action ${isLiked ? 'liked' : ''}`}>
            <FaHeart color={isLiked ? 'red' : 'white'} /> 
            <span>{currentReel.likes}</span>
          </button>
          <button onClick={() => setCommentPopup(true)} className="reel-action">
            <FaCommentAlt /> 
            <span>{currentReel.comments?.length || 0}</span>
          </button>
          <button onClick={toggleMute} className="reel-action">
            {muted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <button className="reel-action">
            <FaShare />
          </button>
        </div>
        
        <div className="reel-details">
          <div className="reel-user-info">
            {currentReel.userPhoto && (
              <img src={currentReel.userPhoto} alt="User" className="user-avatar" />
            )}
            <span className="user-name">{currentReel.userName || 'Anonymous'}</span>
          </div>
          <h3>{currentReel.title}</h3>
          <p>{currentReel.description}</p>
          <p className="reel-views">{currentReel.views || 0} views</p>
        </div>
        
        <div className="reel-navigation">
          {currentReelIndex > 0 && (
            <button 
              className="nav-button prev" 
              onClick={() => setCurrentReelIndex(prev => prev - 1)}
            >
              ▲
            </button>
          )}
          {currentReelIndex < reels.length - 1 && (
            <button 
              className="nav-button next" 
              onClick={() => setCurrentReelIndex(prev => prev + 1)}
            >
              ▼
            </button>
          )}
        </div>
      </div>

      {commentPopup && (
        <div className="comment-popup">
          <div className="comment-popup-content">
            <div className="comment-header">
              <h3>Comments ({currentReel.comments?.length || 0})</h3>
              <button onClick={() => setCommentPopup(false)} className="close-btn">
                &times;
              </button>
            </div>
            
            <div className="comments-list">
              {currentReel.comments?.length > 0 ? (
                <ul>
                  {currentReel.comments.map((comment, index) => (
                    <li key={index} className="comment-item">
                      {comment.userPhoto && (
                        <img src={comment.userPhoto} alt="User" className="comment-user-avatar" />
                      )}
                      <div className="comment-content">
                        <strong>{comment.userName || 'Anonymous'}</strong>
                        <p>{comment.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
              )}
            </div>
            
            <div className="comment-input-container">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)}
                className="comment-input"
              />
              <button 
                onClick={handleCommentSubmit}
                disabled={!newComment.trim() || !user}
                className="comment-submit"
              >
                Submit
              </button>
            </div>
            
            {!user && (
              <p className="login-prompt">Please log in to comment</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelsDisplay;
