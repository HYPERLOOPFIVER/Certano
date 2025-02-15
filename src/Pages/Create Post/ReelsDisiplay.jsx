import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/Firebase';
import { collection, getDocs, updateDoc, doc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { FaHeart, FaCommentAlt, FaShare, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import '../Create Post/ReelsDisiplay.css';

const ReelsDisplay = () => {
  const { id } = useParams(); // Get the reel id from URL params
  const navigate = useNavigate();
  const [reels, setReels] = useState([]); // Store the list of reels
  const [currentReelIndex, setCurrentReelIndex] = useState(0); // Track the current reel index
  const [newComment, setNewComment] = useState('');
  const [commentPopup, setCommentPopup] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add a loading state
  const reelContainerRef = useRef(null); // Ref for the reel container
  const currentUserId = 'exampleUserId'; // Replace with actual user ID
  const currentUserName = 'Example User'; // Replace with actual user name

  // Fetch all reels once on mount
  useEffect(() => {
    const fetchReels = async () => {
      const reelsCollection = collection(db, 'reels');
      const reelsSnapshot = await getDocs(reelsCollection);
      const reelsList = reelsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReels(reelsList);
      setIsLoading(false); // Set loading to false after fetching
    };
    fetchReels();
  }, []);

  // Set the current reel index based on the `id` from URL
  useEffect(() => {
    if (!isLoading && reels.length > 0) {
      const reelIndex = reels.findIndex((reel) => reel.id === id);
      setCurrentReelIndex(reelIndex >= 0 ? reelIndex : 0); // Set the reel index, default to 0 if not found
    }
  }, [id, reels, isLoading]); // Add isLoading as a dependency

  // Handle swipe gestures (up/down)
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY > 0) {
        // Swipe down: go to the next reel
        if (currentReelIndex < reels.length - 1) {
          setCurrentReelIndex((prev) => prev + 1);
          navigate(`/reels/${reels[currentReelIndex + 1].id}`);
        }
      } else if (e.deltaY < 0) {
        // Swipe up: go to the previous reel
        if (currentReelIndex > 0) {
          setCurrentReelIndex((prev) => prev - 1);
          navigate(`/reels/${reels[currentReelIndex - 1].id}`);
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
  }, [currentReelIndex, reels, navigate]);

  // Play the video when the current reel changes
  useEffect(() => {
    if (reels[currentReelIndex]) {
      const videoElement = document.getElementById(`video-${reels[currentReelIndex].id}`);
      if (videoElement) {
        videoElement.pause(); // Pause the current video
        videoElement.load(); // Load the new video source
        videoElement.play(); // Play the new video
      }
    }
  }, [currentReelIndex, reels]);

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
        likes: increment(hasLiked ? -1 : 1), // Decrease or increase likes
        likedUsers: hasLiked ? arrayRemove(currentUserId) : arrayUnion(currentUserId), // Remove or add user ID
      });

      // Update the local state
      setReels((prevReels) => {
        const updatedReels = [...prevReels];
        updatedReels[currentReelIndex] = {
          ...currentReel,
          likes: currentReel.likes + (hasLiked ? -1 : 1),
          likedUsers: hasLiked
            ? currentReel.likedUsers.filter((uid) => uid !== currentUserId) // Remove user ID if unliked
            : [...(currentReel.likedUsers || []), currentUserId], // Add user ID if liked
        };
        return updatedReels;
      });
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    const currentReel = reels[currentReelIndex];
    if (!newComment.trim() || !currentReel) return;
    const reelDocRef = doc(db, 'reels', currentReel.id);
    await updateDoc(reelDocRef, {
      comments: arrayUnion({ text: newComment.trim(), userId: currentUserId, userName: currentUserName, timestamp: new Date() }),
    });
    setReels((prevReels) => {
      const updatedReels = [...prevReels];
      updatedReels[currentReelIndex] = {
        ...currentReel,
        comments: [...(currentReel.comments || []), { text: newComment.trim(), userId: currentUserId, userName: currentUserName, timestamp: new Date() }],
      };
      return updatedReels;
    });
    setNewComment('');
  };

  // Toggle mute/unmute for the video
  const toggleMute = () => setMuted((prev) => !prev);

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading indicator
  }

  if (reels.length === 0) {
    return <div>No reels found.</div>; // Fallback if no reels are found
  }

  const currentReel = reels[currentReelIndex];

  return (
    <div className="reel-container" ref={reelContainerRef}>
      <div className="reel-item">
        <video
          id={`video-${currentReel.id}`}
          playsInline
          muted={muted}
          loop
          className="reel-video"
        >
          <source src={currentReel.video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="reel-actions">
          <button onClick={handleLike} className="reel-action">
            <FaHeart
              style={{
                color: currentReel.likedUsers?.includes(currentUserId) ? 'red' : 'white', // Change heart color if liked
              }}
            />{' '}
            {currentReel.likes || 0}
          </button>
          <button onClick={() => setCommentPopup(true)} className="reel-action">
            <FaCommentAlt /> {currentReel.comments?.length || 0}
          </button>
          <button onClick={toggleMute} className="reel-action">
            {muted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <button className="reel-action">
            <FaShare />
          </button>
        </div>
        <div className="reel-details">
          <h3>{currentReel.title}</h3>
          <p>{currentReel.description}</p>
        </div>
      </div>

      {commentPopup && (
        <div className="comment-popup">
          <div className="comment-popup-content">
            <h3>Comments</h3>
            <button onClick={() => setCommentPopup(false)} className="close-btn">
              &times;
            </button>
            <ul>
              {currentReel.comments?.map((comment, index) => (
                <li key={index}>
                  <strong>{comment.userName}:</strong> {comment.text}
                </li>
              ))}
            </ul>
            <input type="text" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
            <button onClick={handleCommentSubmit}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelsDisplay;