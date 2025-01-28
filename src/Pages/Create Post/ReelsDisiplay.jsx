import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase/Firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { FaHeart, FaCommentAlt, FaShare, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../Create Post/ReelsDisiplay.css';

const ReelsDisplay = () => {
  const [reels, setReels] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentPopup, setCommentPopup] = useState(null);
  const [mutedVideos, setMutedVideos] = useState(new Set());
  const reelRefs = useRef([]);
  const navigate = useNavigate(); // Initialize navigate
  const currentUserId = 'exampleUserId'; 
  const currentUserName = 'Example User';

  useEffect(() => {
    const fetchReels = async () => {
      const reelsCollection = collection(db, 'reels');
      const reelsSnapshot = await getDocs(reelsCollection);
  
      const fetchUsernames = async (uid) => {
        try {
          const userDoc = await getDocs(collection(db, 'users'));
          const user = userDoc.docs.find((doc) => doc.data().uid === uid);
          return user ? user.data().username : 'Unknown';
        } catch (error) {
          console.error('Error fetching username:', error);
          return 'Unknown';
        }
      };
  
      const reelsList = await Promise.all(
        reelsSnapshot.docs.map(async (doc) => {
          const reelData = doc.data();
          const uploadedBy = await fetchUsernames(reelData.uid); 
          return {
            id: doc.id,
            ...reelData,
            uploadedBy, 
          };
        })
      );
  
      setReels(reelsList);
    };
  
    fetchReels();
  }, []);
  

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.75 }
    );

    reelRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      observer.disconnect();
    };
  }, [reels]);

  const handleLike = async (reelId) => {
    const reelDocRef = doc(db, 'reels', reelId);
    const reelIndex = reels.findIndex((reel) => reel.id === reelId);
    if (reelIndex === -1) return;
  
    const reel = reels[reelIndex];
    const hasLiked = reel.likedUsers?.includes(currentUserId);
  
    try {
      if (hasLiked) {
        await updateDoc(reelDocRef, {
          likes: increment(-1),
          likedUsers: arrayRemove(currentUserId),
        });
  
        setReels((prevReels) => {
          const updatedReels = [...prevReels];
          updatedReels[reelIndex] = {
            ...reel,
            likes: reel.likes - 1,
            likedUsers: reel.likedUsers.filter((userId) => userId !== currentUserId),
          };
          return updatedReels;
        });
      } else {
        await updateDoc(reelDocRef, {
          likes: increment(1),
          likedUsers: arrayUnion(currentUserId),
        });
  
        setReels((prevReels) => {
          const updatedReels = [...prevReels];
          updatedReels[reelIndex] = {
            ...reel,
            likes: reel.likes + 1,
            likedUsers: [...(reel.likedUsers || []), currentUserId],
          };
          return updatedReels;
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };
  
  const openCommentPopup = (reelId) => {
    setCommentPopup(reelId);
  };

  const closeCommentPopup = () => {
    setCommentPopup(null);
    setNewComment('');
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !commentPopup) return;

    const reelDocRef = doc(db, 'reels', commentPopup);

    await updateDoc(reelDocRef, {
      comments: arrayUnion({
        text: newComment.trim(),
        userId: currentUserId,
        userName: currentUserName,
        timestamp: new Date(),
      }),
    });

    setReels((prevReels) =>
      prevReels.map((reel) =>
        reel.id === commentPopup
          ? {
              ...reel,
              comments: [
                ...(reel.comments || []),
                {
                  text: newComment.trim(),
                  userId: currentUserId,
                  userName: currentUserName,
                  timestamp: new Date(),
                },
              ],
            }
          : reel
      )
    );

    setNewComment('');
  };

  const toggleMute = (index) => {
    setMutedVideos((prev) => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }
      return updated;
    });
  };

  const goToProfile = (uid) => {
    navigate(`/profile/${uid}`); // Navigate to the profile page
  };

  return (
    <div className="reels-container">
      {reels.map((reel, index) => (
        <div key={reel.id} className="reel">
          <div className="reel-content">
            <video
              ref={(el) => (reelRefs.current[index] = el)}
              playsInline
              muted={mutedVideos.has(index)}
              loop
              className="reel-video"
            >
              <source src={reel.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="reel-actions">
              <button onClick={() => handleLike(reel.id)} className="reel-action">
                <FaHeart />
                {reel.likes || 0}
              </button>
              <button
                onClick={() => openCommentPopup(reel.id)}
                className="reel-action"
              >
                <FaCommentAlt /> {reel.comments?.length || 0}
              </button>
              <button onClick={() => toggleMute(index)} className="reel-action">
                {mutedVideos.has(index) ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <button className="reel-action">
                <FaShare />
              </button>
            </div>
          </div>
          <div className="reel-details">
            <h3 className="reel-title">{reel.title}</h3>
            <p className="reel-description">{reel.description}</p>
            <p className="reel-uploader">
              Uploaded by:{' '}
              <strong
                className="reel-uploader-link"
                onClick={() => goToProfile(reel.uid)}
                style={{ cursor: 'pointer', color: 'white' }}
              >
                {reel.uid}
              </strong>
            </p>
          </div>
        </div>
      ))}

      {commentPopup && (
        <div className="comment-popup">
          <div className="comment-popup-content">
            <h3>Comments</h3>
            <button onClick={closeCommentPopup} className="close-btn">
              &times;
            </button>
            <ul className="comment-list">
              {(reels.find((reel) => reel.id === commentPopup)?.comments || []).map(
                (comment, index) => (
                  <li key={index}>
                    <strong>{comment.userName}:</strong> {comment.text}
                  </li>
                )
              )}
            </ul>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={handleCommentSubmit}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelsDisplay;
