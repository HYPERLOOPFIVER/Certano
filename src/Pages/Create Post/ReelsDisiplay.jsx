import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../../firebase/Firebase';
import { collection, getDocs, updateDoc, doc, increment, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { FaHeart, FaRegHeart, FaCommentAlt, FaShare, FaBookmark, FaRegBookmark, FaVolumeMute, FaVolumeUp, FaUserCircle, FaEllipsisH, FaMusic, FaPlay, FaPause, FaDice, FaRandom } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import './ReelsDisiplay.css';

const ReelsDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [commentPopup, setCommentPopup] = useState(false);
  const [sharePopup, setSharePopup] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [transition, setTransition] = useState(false);
  const [heartAnimation, setHeartAnimation] = useState(false);
  const [saved, setSaved] = useState(false);
  const [optionsMenu, setOptionsMenu] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [userProfiles, setUserProfiles] = useState({});
  
  const reelContainerRef = useRef(null);
  const videoRef = useRef(null);
  const progressInterval = useRef(null);
  const swipeStartY = useRef(0);
  
  const currentUserId = 'exampleUserId';
  const currentUserName = 'Example User';

  // Fetch user profiles
  const fetchUserProfiles = async (userIds) => {
    const profiles = {};
    
    for (const userId of userIds) {
      if (userId) {
        try {
          const userDocRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            profiles[userId] = userDoc.data();
          }
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
        }
      }
    }
    
    return profiles;
  };

  // Fetch all reels once on mount
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const reelsCollection = collection(db, 'reels');
        const reelsSnapshot = await getDocs(reelsCollection);
        const reelsList = reelsSnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data(),
          likedUsers: doc.data().likedUsers || [],
          comments: doc.data().comments || [],
          saved: doc.data().savedUsers?.includes(currentUserId) || false,
        }));
        
        // Sort by popularity or recency
        reelsList.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
        
        setReels(reelsList);
        
        // Extract all unique user IDs and fetch their profiles
        const userIds = [...new Set(reelsList.map(reel => reel.userId))];
        const profiles = await fetchUserProfiles(userIds);
        setUserProfiles(profiles);
        
        setIsLoading(false);
        
        // Hide instructions after 3 seconds
        setTimeout(() => {
          setShowInstructions(false);
        }, 3000);
      } catch (error) {
        console.error("Error fetching reels:", error);
        setIsLoading(false);
      }
    };
    
    fetchReels();
  }, []);

  // Set the current reel index based on the `id` from URL
  useEffect(() => {
    if (!isLoading && reels.length > 0) {
      if (id === 'random') {
        // Select a random reel
        const randomIndex = Math.floor(Math.random() * reels.length);
        setCurrentReelIndex(randomIndex);
        setSaved(reels[randomIndex].saved);
        // Update URL to reflect the randomly selected reel (for sharing)
        navigate(`/reels/${reels[randomIndex].id}`, { replace: true });
      } else {
        const reelIndex = reels.findIndex((reel) => reel.id === id);
        if (reelIndex >= 0) {
          setCurrentReelIndex(reelIndex);
          setSaved(reels[reelIndex].saved);
        } else {
          // If ID not found, navigate to the first reel
          navigate(`/reels/${reels[0].id}`, { replace: true });
          setCurrentReelIndex(0);
          setSaved(reels[0].saved);
        }
      }
    }
  }, [id, reels, isLoading, navigate]);

  // Load random reel
  const loadRandomReel = () => {
    if (reels.length > 0) {
      setTransition(true);
      
      // Pause current video
      if (videoRef.current) {
        videoRef.current.pause();
      }
      
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * reels.length);
        setCurrentReelIndex(randomIndex);
        // Update URL to reflect the randomly selected reel
        navigate(`/reels/${reels[randomIndex].id}`, { replace: true });
        setSaved(reels[randomIndex].saved);
        
        // Reset progress
        setProgress(0);
        
        setTimeout(() => {
          setTransition(false);
          // Play new video
          if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch(err => console.error("Play after random reel change failed:", err));
            setIsVideoPlaying(true);
          }
        }, 300);
      }, 300);
    }
  };

  // Handle progress bar
  useEffect(() => {
    if (!isLoading && reels.length > 0 && videoRef.current) {
      // Clear any existing interval
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      // Reset progress
      setProgress(0);
      
      const video = videoRef.current;
      
      const updateProgressBar = () => {
        if (!video.paused) {
          const progressPercentage = (video.currentTime / video.duration) * 100;
          setProgress(progressPercentage);
        }
      };
      
      const onLoadedMetadata = () => {
        progressInterval.current = setInterval(updateProgressBar, 100);
      };
      
      const onEnded = () => {
        video.currentTime = 0;
        video.play().catch(err => console.error("Auto replay failed:", err));
      };
      
      // Add event listeners
      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('ended', onEnded);
      
      // Force video to load and play
      video.load();
      video.play().catch(err => console.error("Initial play failed:", err));
      
      return () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('ended', onEnded);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
    }
  }, [currentReelIndex, isLoading, reels]);

  // Handle swipe gestures (up/down)
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY > 50) {
        // Swipe down: go to the next reel
        if (currentReelIndex < reels.length - 1) {
          handleReelChange(currentReelIndex + 1);
        }
      } else if (e.deltaY < -50) {
        // Swipe up: go to the previous reel
        if (currentReelIndex > 0) {
          handleReelChange(currentReelIndex - 1);
        }
      }
    };

    const handleTouchStart = (e) => {
      swipeStartY.current = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      // Prevent default to disable browser's natural scrolling
      e.preventDefault();
    };
    
    const handleTouchEnd = (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = swipeStartY.current - touchEndY;
      
      // Threshold for swipe detection (50px)
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe up: go to the next reel
          if (currentReelIndex < reels.length - 1) {
            handleReelChange(currentReelIndex + 1);
          }
        } else {
          // Swipe down: go to the previous reel
          if (currentReelIndex > 0) {
            handleReelChange(currentReelIndex - 1);
          }
        }
      }
    };
    
    const container = reelContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [currentReelIndex, reels.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' && currentReelIndex > 0) {
        handleReelChange(currentReelIndex - 1);
      } else if (e.key === 'ArrowDown' && currentReelIndex < reels.length - 1) {
        handleReelChange(currentReelIndex + 1);
      } else if (e.key === 'm') {
        toggleMute();
      } else if (e.key === ' ' || e.key === 'k') {
        togglePlayPause();
        e.preventDefault(); // Prevent page scroll on spacebar
      } else if (e.key === 'l') {
        handleLike();
      } else if (e.key === 'r') {
        loadRandomReel(); // Added - 'r' key for random reel
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentReelIndex, reels.length]);

  // Handle smooth transition between reels
  const handleReelChange = (newIndex) => {
    if (newIndex < 0 || newIndex >= reels.length || newIndex === currentReelIndex) {
      return;
    }
    
    setTransition(true);
    
    // Pause current video
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    setTimeout(() => {
      setCurrentReelIndex(newIndex);
      // Set ID in URL for deeplink sharing
      navigate(`/reels/${reels[newIndex].id}`, { replace: true });
      
      // Check if this reel is saved
      setSaved(reels[newIndex].saved);
      
      // Reset progress
      setProgress(0);
      
      setTimeout(() => {
        setTransition(false);
        // Play new video
        if (videoRef.current) {
          videoRef.current.load();
          videoRef.current.play().catch(err => console.error("Play after reel change failed:", err));
          setIsVideoPlaying(true);
        }
      }, 300);
    }, 300);
  };

  // Handle user profile navigation
  const handleUserProfileClick = (userId) => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play()
        .then(() => setIsVideoPlaying(true))
        .catch(err => console.error("Play failed:", err));
    } else {
      video.pause();
      setIsVideoPlaying(false);
    }
  };

  // Double click to like
  const handleVideoDoubleClick = (e) => {
    // Don't trigger if clicking on action buttons
    if (e.target.closest('.reel-actions') || 
        e.target.closest('.user-info') || 
        e.target.closest('.reel-details') ||
        e.target.closest('.play-pause-container')) return;
    
    handleLike();
    setHeartAnimation(true);
    setTimeout(() => {
      setHeartAnimation(false);
    }, 1000);
  };

  // Handle the like functionality
  const handleLike = async () => {
    const currentReel = reels[currentReelIndex];
    if (!currentReel) return;

    // Check if the current user has already liked the reel
    const hasLiked = currentReel.likedUsers?.includes(currentUserId);

    try {
      const reelDocRef = doc(db, 'reels', currentReel.id);

      // Update the Firestore document
      await updateDoc(reelDocRef, {
        likes: increment(hasLiked ? -1 : 1),
        likedUsers: hasLiked ? arrayRemove(currentUserId) : arrayUnion(currentUserId),
      });

      // Update the local state
      setReels((prevReels) => {
        const updatedReels = [...prevReels];
        updatedReels[currentReelIndex] = {
          ...currentReel,
          likes: (currentReel.likes || 0) + (hasLiked ? -1 : 1),
          likedUsers: hasLiked
            ? currentReel.likedUsers.filter((uid) => uid !== currentUserId)
            : [...(currentReel.likedUsers || []), currentUserId],
        };
        return updatedReels;
      });
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  // Handle save functionality
  const handleSave = async () => {
    const currentReel = reels[currentReelIndex];
    if (!currentReel) return;

    try {
      const reelDocRef = doc(db, 'reels', currentReel.id);
      
      // Update Firestore
      await updateDoc(reelDocRef, {
        savedUsers: saved 
          ? arrayRemove(currentUserId) 
          : arrayUnion(currentUserId),
      });
      
      // Update local state
      setSaved(!saved);
      
      // Update reels array
      setReels((prevReels) => {
        const updatedReels = [...prevReels];
        updatedReels[currentReelIndex] = {
          ...currentReel,
          saved: !saved
        };
        return updatedReels;
      });
    } catch (error) {
      console.error('Error saving reel:', error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    const currentReel = reels[currentReelIndex];
    if (!newComment.trim() || !currentReel) return;
    
    const newCommentObj = { 
      text: newComment.trim(), 
      userId: currentUserId, 
      userName: currentUserName, 
      timestamp: new Date(),
      likes: 0,
      likedBy: []
    };
    
    try {
      const reelDocRef = doc(db, 'reels', currentReel.id);
      await updateDoc(reelDocRef, {
        comments: arrayUnion(newCommentObj),
        commentCount: increment(1)
      });
      
      setReels((prevReels) => {
        const updatedReels = [...prevReels];
        updatedReels[currentReelIndex] = {
          ...currentReel,
          comments: [
            ...(currentReel.comments || []), 
            newCommentObj
          ],
          commentCount: (currentReel.commentCount || 0) + 1
        };
        return updatedReels;
      });
      
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handle comment like
  const handleCommentLike = async (commentIndex) => {
    const currentReel = reels[currentReelIndex];
    if (!currentReel || !currentReel.comments) return;
    
    const comment = currentReel.comments[commentIndex];
    const hasLiked = comment.likedBy?.includes(currentUserId);
    
    try {
      const updatedComments = [...currentReel.comments];
      updatedComments[commentIndex] = {
        ...comment,
        likes: (comment.likes || 0) + (hasLiked ? -1 : 1),
        likedBy: hasLiked 
          ? (comment.likedBy || []).filter(id => id !== currentUserId)
          : [...(comment.likedBy || []), currentUserId]
      };
      
      const reelDocRef = doc(db, 'reels', currentReel.id);
      await updateDoc(reelDocRef, {
        comments: updatedComments
      });
      
      setReels(prevReels => {
        const updatedReels = [...prevReels];
        updatedReels[currentReelIndex] = {
          ...currentReel,
          comments: updatedComments
        };
        return updatedReels;
      });
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  // Toggle mute/unmute for the video
  const toggleMute = () => setMuted((prev) => !prev);

  // Handle share
  const handleShare = () => {
    setSharePopup(true);
  };

  // Format number for display (1K, 1M, etc)
  const formatNumber = (num) => {
    if (!num) return 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  // Get user display name from profiles
  const getUserDisplayName = (userId) => {
    if (!userId) return 'Unknown User';
    const userProfile = userProfiles[userId];
    return userProfile ? (userProfile.displayName || userProfile.username || userProfile.name || 'User') : 'User';
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <CgSpinner className="loading-spinner" />
        <p>Loading reels...</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="no-reels-container">
        <div className="no-reels-content">
          <h2>No reels found</h2>
          <p>Be the first to create a reel!</p>
          <button className="create-reel-btn">Create Reel</button>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentReelIndex];

  return (
    <div className="reels-page">
      <div className="reel-container" ref={reelContainerRef}>
        <div className={`reel-item ${transition ? 'transitioning' : ''}`}>
          <video
            id={`video-${currentReel.id}`}
            ref={videoRef}
            playsInline
            muted={muted}
            loop
            autoPlay
            className="reel-video"
            src={currentReel.video}
          >
            <source src={currentReel.video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Video controls overlay */}
          <div className="video-controls-overlay" onClick={togglePlayPause}>
            {/* Enhanced play/pause button */}
            <div className="play-pause-container">
              {!isVideoPlaying ? (
                <div className="play-button-large">
                  <FaPlay size={50} />
                </div>
              ) : null}
            </div>
            
            {/* Heart animation on double-click */}
            {heartAnimation && (
              <div className="heart-animation">
                <FaHeart color="white" size={80} />
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="reel-progress-container">
            <div className="reel-progress-bg"></div>
            <div className="reel-progress" style={{ width: `${progress}%` }}></div>
          </div>
          
          {/* Visual effects layer */}
          <div className="reel-visual-effect" onDoubleClick={handleVideoDoubleClick}></div>
          
          {/* Navigation indicators */}
          <div className="nav-indicator">
            {reels.map((_, index) => (
              <div 
                key={index} 
                className={`indicator-dot ${index === currentReelIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReelChange(index);
                }}
              ></div>
            ))}
          </div>
          
          {/* Header with app name/logo */}
          <div className="reels-header">
            <h1>Reels</h1>
            <div className="header-camera-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            </div>
          </div>
          
          {/* Random Reel Button - NEW FEATURE */}
          <div className="random-reel-button" onClick={(e) => {
            e.stopPropagation();
            loadRandomReel();
          }}>
            <FaDice size={20} />
            <span>Random</span>
          </div>
          
          {/* User info */}
          <div className="user-info" onClick={(e) => e.stopPropagation()}>
            <div 
              className="user-avatar"
              onClick={() => currentReel.userId && handleUserProfileClick(currentReel.userId)}
            >
              {currentReel.userAvatar ? (
                <img src={currentReel.userAvatar} alt={getUserDisplayName(currentReel.userId)} />
              ) : (
                <FaUserCircle size={42} />
              )}
            </div>
            <div className="user-details">
              <span 
                className="user-name"
                onClick={() => currentReel.userId && handleUserProfileClick(currentReel.userId)}
                style={{ cursor: 'pointer' }}
              >
                {getUserDisplayName(currentReel.userId)}
              </span>
              <button className="follow-button">Follow</button>
            </div>
            <button 
              className="options-button" 
              onClick={(e) => {
                e.stopPropagation();
                setOptionsMenu(!optionsMenu);
              }}
            >
              <FaEllipsisH />
            </button>
            
            {/* Options menu */}
            {optionsMenu && (
              <div className="options-menu">
                <ul>
                  <li>Report</li>
                  <li>Not interested</li>
                  <li>Copy link</li>
                  <li>Share to...</li>
                  <li onClick={loadRandomReel}>Show random reel</li> {/* NEW MENU OPTION */}
                </ul>
              </div>
            )}
          </div>
          
          {/* Music info */}
          <div className="music-info" onClick={(e) => e.stopPropagation()}>
            <FaMusic />
            <div className="music-details">
              <span>{currentReel.songName || 'Original Audio'}</span>
              <span className="artist-name">{currentReel.artistName || getUserDisplayName(currentReel.userId) || 'Unknown Artist'}</span>
            </div>
          </div>
          
          {/* Centered play/pause button */}
          <div className="center-play-pause" onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}>
            {!isVideoPlaying ? (
              <FaPlay className="center-play-icon" />
            ) : (
              <FaPause className="center-pause-icon" />
            )}
          </div>
          
          {/* Actions */}
          <div className="reel-actions" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={handleLike} 
              className={`reel-action ${heartAnimation ? 'heart-pulse' : ''}`}
            >
              {currentReel.likedUsers?.includes(currentUserId) ? (
                <FaHeart className="action-icon filled" />
              ) : (
                <FaRegHeart className="action-icon" />
              )}
              <span className="action-count">{formatNumber(currentReel.likes)}</span>
            </button>
            
            <button onClick={() => setCommentPopup(true)} className="reel-action">
              <FaCommentAlt className="action-icon" />
              <span className="action-count">{formatNumber(currentReel.comments?.length)}</span>
            </button>
            
            <button onClick={handleShare} className="reel-action">
              <FaShare className="action-icon" />
              <span className="action-count">Share</span>
            </button>
            
            <button onClick={loadRandomReel} className="reel-action">
              <FaRandom className="action-icon" />
              <span className="action-count">Random</span>
            </button>
            
            <button onClick={handleSave} className="reel-action">
              {saved ? (
                <FaBookmark className="action-icon filled" />
              ) : (
                <FaRegBookmark className="action-icon" />
              )}
            </button>
            
            <button onClick={toggleMute} className="reel-action">
              {muted ? <FaVolumeMute className="action-icon" /> : <FaVolumeUp className="action-icon" />}
            </button>
          </div>
          
          {/* Reel details */}
          <div className="reel-details" onClick={(e) => e.stopPropagation()}>
            <h3 className="reel-title">{currentReel.title}</h3>
            <p className="reel-description">{currentReel.description}</p>
            {currentReel.hashtags && (
              <div className="reel-hashtags">
                {currentReel.hashtags.map((tag, index) => (
                  <span key={index} className="hashtag">#{tag}</span>
                ))}
              </div>
            )}
          </div>
          
          {/* Navigation buttons */}
          <div className="reel-navigation">
            {currentReelIndex > 0 && (
              <button 
                className="nav-button prev-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReelChange(currentReelIndex - 1);
                }}
              >
                ▲
              </button>
            )}
            {currentReelIndex < reels.length - 1 && (
              <button 
                className="nav-button next-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReelChange(currentReelIndex + 1);
                }}
              >
                ▼
              </button>
            )}
          </div>
          
          {/* Transition overlay */}
          <div className={`reel-transition ${transition ? 'active' : ''}`}></div>
          
          {/* Initial instructions overlay */}
          {showInstructions && (
            <div className="swipe-instructions">
              <div className="instructions-container">
                <div className="swipe-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </div>
                <span>Swipe up for next reel</span>
              </div>
              <div className="instructions-container">
                <div className="tap-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                  </svg>
                </div>
                <span>Double-tap to like</span>
              </div>
              <div className="instructions-container">
                <div className="tap-icon">
                  <FaDice />
                </div>
                <span>Tap random for surprise</span>
              </div>
            </div>
          )}
        </div>

  

        {/* Comment popup */}
        {commentPopup && (
          <div className="comment-popup" onClick={(e) => e.target === e.currentTarget && setCommentPopup(false)}>
            <div className="comment-popup-content">
              <div className="comment-header">
                <h3>Comments</h3>
                <button onClick={() => setCommentPopup(false)} className="close-btn">
                  &times;
                </button>
              </div>
              
              <div className="comment-list-wrapper">
                {currentReel.comments && currentReel.comments.length > 0 ? (
                  <ul className="comment-list">
                    {currentReel.comments.map((comment, index) => (
                      <li key={index} className="comment-item">
                        <div className="comment-avatar">
                          <FaUserCircle />
                        </div>
                        <div className="comment-content">
                          <div className="comment-user-info">
                            <strong>{comment.userName}</strong>
                            <span className="comment-time">
                              {comment.timestamp ? 
                                new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                                  Math.floor((comment.timestamp.toDate() - new Date()) / (60 * 60 * 1000)), 'hour'
                                ) : 'Just now'}
                            </span>
                          </div>
                          <p>{comment.text}</p>
                          <div className="comment-actions">
                            <button onClick={() => handleCommentLike(index)}>
                              {comment.likedBy?.includes(currentUserId) ? (
                                <FaHeart className="comment-like-filled" />
                              ) : (
                                <FaRegHeart />
                              )}
                              <span>{comment.likes || 0}</span>
                            </button>
                            <button>Reply</button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="no-comments">
                    <p>No comments yet. Be the first!</p>
                  </div>
                )}
              </div>
              
              <div className="comment-input-container">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                />
                <button 
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim()}
                  className={!newComment.trim() ? 'disabled' : ''}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}

     
        {/* Share popup */}
        {sharePopup && (
          <div className="share-popup" onClick={(e) => e.target === e.currentTarget && setSharePopup(false)}>
            <div className="share-popup-content">
              <div className="share-header">
                <h3>Share</h3>
                <button onClick={() => setSharePopup(false)} className="close-btn">
                  &times;
                </button>
              </div>
              
              <div className="share-options">
                <div className="share-option">
                  <div className="share-icon whatsapp">
                    <svg viewBox="0 0 24 24" width="24" height="24"><path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z" fill="currentColor"/><path d="M20.52 3.449C12.831-3.172.521 1.33.461 11.892c0 1.485.3 2.85.824 4.215l-1.175 4.34 4.316-1.19a10.877 10.877 0 0 0 4.59 1.215c9.834.15 15.3-7.993 15.3-15.067 0-1.753-.645-3.44-1.797-4.956zm.778 11.342c-.403 5.253-5.671 8.703-10.681 8.376-2.052.045-4.045-.494-5.727-1.55l-1.701.464.525-1.695a10.592 10.592 0 0 1-1.674-5.711c0-6.445 5.534-10.775 10.95-10.775 1.647-.06 3.347.494 4.694 1.607 1.753 1.365 2.954 3.334 2.614 5.893z" fill="currentColor"/></svg>
                  </div>
                  <span>WhatsApp</span>
                </div>
                
                <div className="share-option">
                  <div className="share-icon facebook">
                    <svg viewBox="0 0 24 24" width="24" height="24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 2412.073z" fill="currentColor"/></svg>
                  </div>
                  <span>Facebook</span>
                </div>
                
                <div className="share-option">
                  <div className="share-icon twitter">
                    <svg viewBox="0 0 24 24" width="24" height="24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" fill="currentColor"/></svg>
                  </div>
                  <span>Twitter</span>
                </div>
                
                <div className="share-option">
                  <div className="share-icon instagram">
                    <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" fill="currentColor"/></svg>
                  </div>
                  <span>Instagram</span>
                </div>
                
                <div className="share-option">
                  <div className="share-icon telegram">
                    <svg viewBox="0 0 24 24" width="24" height="24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" fill="currentColor"/></svg>
                  </div>
                  <span>Telegram</span>
                </div>
              </div>
              
              <div className="copy-link-container">
                <input 
                  type="text" 
                  value={`https://example.com/reels/${currentReel.id}`} 
                  readOnly 
                />
                <button>Copy</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelsDisplay;