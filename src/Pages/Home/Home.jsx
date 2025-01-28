import React, { useState, useEffect, useRef } from 'react';
import { db } from "../../firebase/Firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { FaHeart, FaCommentAlt, FaShare, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import './Home.css';

export default function Home() {
  const [feed, setFeed] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentPopup, setCommentPopup] = useState(null);
  const [mutedVideos, setMutedVideos] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const reelRefs = useRef([]);
  const navigate = useNavigate();

  const currentUserId = 'exampleUserId'; 
  const currentUserName = 'Example User';

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const postsSnapshot = await getDocs(collection(db, "posts"));
        const posts = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: "post",
          ...doc.data(),
        }));

        const reelsSnapshot = await getDocs(collection(db, "reels"));
        const reels = reelsSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: "reel",
          ...doc.data(),
        }));

        const combinedFeed = [...posts, ...reels];
        const shuffledFeed = combinedFeed.sort(() => Math.random() - 0.5);
        setFeed(shuffledFeed);
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
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
  }, [feed]);

  const handleLike = async (itemId) => {
    const itemDocRef = doc(db, 'reels', itemId);
    const itemIndex = feed.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return;

    const item = feed[itemIndex];
    const hasLiked = item.likedUsers?.includes(currentUserId);

    try {
      if (hasLiked) {
        await updateDoc(itemDocRef, {
          likes: increment(-1),
          likedUsers: arrayRemove(currentUserId),
        });

        setFeed((prevFeed) => {
          const updatedFeed = [...prevFeed];
          updatedFeed[itemIndex] = {
            ...item,
            likes: item.likes - 1,
            likedUsers: item.likedUsers.filter((userId) => userId !== currentUserId),
          };
          return updatedFeed;
        });
      } else {
        await updateDoc(itemDocRef, {
          likes: increment(1),
          likedUsers: arrayUnion(currentUserId),
        });

        setFeed((prevFeed) => {
          const updatedFeed = [...prevFeed];
          updatedFeed[itemIndex] = {
            ...item,
            likes: item.likes + 1,
            likedUsers: [...(item.likedUsers || []), currentUserId],
          };
          return updatedFeed;
        });
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const openCommentPopup = (itemId) => {
    setCommentPopup(itemId);
  };

  const closeCommentPopup = () => {
    setCommentPopup(null);
    setNewComment('');
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !commentPopup) return;

    const itemDocRef = doc(db, 'reels', commentPopup);

    await updateDoc(itemDocRef, {
      comments: arrayUnion({
        text: newComment.trim(),
        userId: currentUserId,
        userName: currentUserName,
        timestamp: new Date(),
      }),
    });

    setFeed((prevFeed) =>
      prevFeed.map((item) =>
        item.id === commentPopup
          ? {
              ...item,
              comments: [
                ...(item.comments || []),
                {
                  text: newComment.trim(),
                  userId: currentUserId,
                  userName: currentUserName,
                  timestamp: new Date(),
                },
              ],
            }
          : item
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

  if (loading) {
    return <div className="loading">Loading feed...</div>;
  }

  return (
    <div className="home-container">
      <div className="feed">
        {feed.map((item, index) => (
          <div key={item.id} className="feed-item">
            {item.type === "post" ? (
              <div className="post">
                <h3>{item.title}</h3>
                {item.image && <img src={item.image} alt={item.title} />}
                <small>By: {item.author}</small>
              </div>
            ) : (
              <div className="reel">
                <video
                  ref={(el) => (reelRefs.current[index] = el)}
                  playsInline
                  muted={mutedVideos.has(index)}
                  loop
                  className="reel-video"
                >
                  <source src={item.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="reel-actions">
                  <button onClick={() => handleLike(item.id)} className="reel-action">
                    <FaHeart />
                    {item.likes || 0}
                  </button>
                  <button
                    onClick={() => openCommentPopup(item.id)}
                    className="reel-action"
                  >
                    <FaCommentAlt /> {item.comments?.length || 0}
                  </button>
                  <button onClick={() => toggleMute(index)} className="reel-action">
                    {mutedVideos.has(index) ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  <button className="reel-action">
                    <FaShare />
                  </button>
                </div>
                <h4>{item.title}</h4>
                <small>By: {item.uid}</small>
              </div>
            )}
          </div>
        ))}
      </div>

      {commentPopup && (
        <div className="comment-popup">
          <div className="comment-popup-content">
            <h3>Comments</h3>
            <button onClick={closeCommentPopup} className="close-btn">
              &times;
            </button>
            <ul className="comment-list">
              {(feed.find((item) => item.id === commentPopup)?.comments || []).map(
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
}
