import { useEffect, useState } from "react";
import { db } from "../../firebase/Firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../../firebase/Firebase";
import './UserProfile.css';

function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();

  // Fetch current user data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        const fetchCurrentUserData = async () => {
          try {
            const userDocRef = doc(db, "users", authUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              setCurrentUser({
                id: authUser.uid,
                email: authUser.email,
                ...userDocSnap.data()
              });
              
              // Check if profile belongs to current user
              setIsOwner(authUser.uid === userId);
            } else {
              setCurrentUser({
                id: authUser.uid,
                email: authUser.email,
                name: authUser.displayName || "Unknown User",
              });
            }
          } catch (err) {
            console.error("Error fetching current user data:", err);
            setError("Failed to load user data. Please try again.");
          }
        };
        
        fetchCurrentUserData();
      } else {
        setCurrentUser(null);
        setIsOwner(false);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // Fetch profile user data
  useEffect(() => {
    const fetchProfileUserData = async () => {
      if (!userId) {
        setError("User not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser({
            id: userId,
            ...userData
          });
          
          if (currentUser?.id) {
            setIsFollowing(userData.followers?.includes(currentUser.id));
          }
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileUserData();
  }, [userId, currentUser?.id]);

  // Fetch posts and reels
  useEffect(() => {
    const fetchMediaContent = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        
        // Fetch posts
        const postsQuery = query(
          collection(db, "posts"),
          where("uid", "==", userId)
        );
        const postsSnap = await getDocs(postsQuery);
        const postsData = postsSnap.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          type: "post",
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));

        // Fetch reels
        const reelsQuery = query(
          collection(db, "reels"),
          where("uid", "==", userId)
        );
        const reelsSnap = await getDocs(reelsQuery);
        const reelsData = reelsSnap.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          type: "reel",
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));

        // Combine and sort by timestamp (newest first)
        const combinedMedia = [...postsData, ...reelsData].sort((a, b) => 
          b.timestamp - a.timestamp
        );
        
        setMedia(combinedMedia);
      } catch (err) {
        console.error("Error fetching media:", err);
        setError("Failed to load posts and reels");
      } finally {
        setLoading(false);
      }
    };

    fetchMediaContent();
  }, [userId]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!userId || !currentUser?.id) {
      // If not logged in, redirect to login
      navigate('/login');
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      const currentUserRef = doc(db, "users", currentUser.id);

      if (isFollowing) {
        // Unfollow
        await updateDoc(userRef, { 
          followers: arrayRemove(currentUser.id) 
        });
        await updateDoc(currentUserRef, { 
          following: arrayRemove(userId) 
        });
      } else {
        // Follow
        await updateDoc(userRef, { 
          followers: arrayUnion(currentUser.id) 
        });
        await updateDoc(currentUserRef, { 
          following: arrayUnion(userId) 
        });
      }

      // Update local state
      const updatedUserSnap = await getDoc(userRef);
      if (updatedUserSnap.exists()) {
        setUser({
          id: userId,
          ...updatedUserSnap.data()
        });
        setIsFollowing(!isFollowing);
      }
    } catch (err) {
      console.error("Error updating follow status:", err);
      setError("Failed to update follow status. Please try again.");
    }
  };

  // Handle chat initiation
  const handleChat = async () => {
    if (!userId || !currentUser?.id) {
      navigate('/login');
      return;
    }

    try {
      // First check if chat already exists between these users
      const chatRoomsRef = collection(db, "chatRooms");
      
      // Create array of both user IDs for query matching
      const userIds = [currentUser.id, userId].sort();
      
      // Query for a chat room containing exactly these two users
      const chatQuery = query(
        chatRoomsRef,
        where("userIds", "==", userIds)
      );
      
      const querySnapshot = await getDocs(chatQuery);
      
      let chatRoomId;
      
      if (!querySnapshot.empty) {
        // Chat exists - use first matching room
        chatRoomId = querySnapshot.docs[0].id;
      } else {
        // Create new chat room
        const newChatRoomRef = doc(collection(db, "chatRooms"));
        chatRoomId = newChatRoomRef.id;
        
        await setDoc(newChatRoomRef, {
          userIds: userIds,
          participants: [
            {
              uid: currentUser.id,
              name: currentUser.name || "Unknown",
              profileImage: currentUser.profileImage || null
            },
            {
              uid: userId,
              name: user.name || "Unknown",
              profileImage: user.profileImage || null
            }
          ],
          lastMessage: {
            text: "Chat started",
            timestamp: new Date(),
            senderId: currentUser.id
          },
          createdAt: new Date()
        });
        
        // Add chat reference to both users' documents
        await updateDoc(doc(db, "users", currentUser.id), {
          chatRooms: arrayUnion(chatRoomId)
        });
        
        await updateDoc(doc(db, "users", userId), {
          chatRooms: arrayUnion(chatRoomId)
        });
      }
      
      // Navigate to chat room
      navigate(`/chat/${chatRoomId}`);
    } catch (err) {
      console.error("Error initiating chat:", err);
      setError("Failed to start chat. Please try again.");
    }
  };

  // Handle edit profile
  const handleEditProfile = () => {
    navigate(`/edit-profile/${userId}`);
  };

  // Filter media by type
  const filteredMedia = activeTab === 'all' 
    ? media 
    : media.filter(item => item.type === activeTab.slice(0, -1)); // Convert 'posts' to 'post', etc.

  if (loading && !user) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>
  );

  if (error && !user) return (
    <div className="error-container">
      <p className="error-message">{error}</p>
      <button onClick={() => navigate(-1)} className="back-button">Go Back</button>
    </div>
  );

  return (
    <div className="user-profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-image-container">
            <img
              src={user?.profileImage || "/default-profile.png"}
              alt={user?.name || "Profile"}
              className="profile-image"
            />
          </div>
          
          <div className="profile-info">
            <div className="profile-name-actions">
              <h2>{user?.name || "User"}</h2>
              
              {isOwner ? (
                <button 
                  className="edit-profile-btn"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </button>
              ) : (
                <div className="profile-actions">
                  <button
                    className={`follow-btn ${isFollowing ? "following" : ""}`}
                    onClick={handleFollow}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  
                  <button 
                    className="message-btn"
                    onClick={handleChat}
                  >
                    Message
                  </button>
                </div>
              )}
            </div>
            
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{media.length}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{user?.followers?.length || 0}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-value">{user?.following?.length || 0}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
            
            <div className="profile-bio">
              {user?.bio ? (
                <p>{user.bio}</p>
              ) : (
                <p className="no-bio">No bio yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="content-tabs">
            <button 
              className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reels' ? 'active' : ''}`}
              onClick={() => setActiveTab('reels')}
            >
              Reels
            </button>
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
          </div>
          
          <div className="media-gallery">
            {filteredMedia.length === 0 ? (
              <div className="no-content">
                <p>No {activeTab} to display</p>
                {isOwner && (
                  <button 
                    className="create-content-btn"
                    onClick={() => navigate(activeTab === 'reels' ? '/create-reel' : '/create-post')}
                  >
                    Create {activeTab === 'all' ? 'Content' : activeTab.slice(0, -1)}
                  </button>
                )}
              </div>
            ) : (
              <div className="media-grid">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className={`media-item ${item.type}`}
                    onClick={() => setSelectedMedia(item)}
                  >
                    {item.type === "post" ? (
                      <img src={item.image} alt={item.caption || "Post"} />
                    ) : (
                      <div className="reel-thumbnail">
                        <video src={item.video} />
                        <div className="reel-icon">▶</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <div className="media-modal-overlay" onClick={closeModal}>
          <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedMedia(null)}>
              &times;
            </button>
            
            <div className="modal-media-container">
              {selectedMedia.type === "post" ? (
                <img 
                  src={selectedMedia.image} 
                  alt={selectedMedia.caption || "Post"} 
                  className="modal-media-content"
                />
              ) : (
                <video 
                  src={selectedMedia.video} 
                  controls 
                  autoPlay 
                  className="modal-media-content"
                />
              )}
            </div>
            
            <div className="modal-info">
              <div className="modal-user-info">
                <img 
                  src={user?.profileImage || "/default-profile.png"} 
                  alt={user?.name} 
                  className="modal-user-img"
                />
                <span className="modal-username">{user?.name}</span>
              </div>
              
              <p className="modal-caption">{selectedMedia.caption || "No caption"}</p>
              
              <div className="modal-stats">
                <span className="modal-likes">
                  <i className="heart-icon">♥</i> {selectedMedia.likes?.length || 0} likes
                </span>
                <span className="modal-comments">
                  <i className="comment-icon">💬</i> {selectedMedia.comments?.length || 0} comments
                </span>
                <span className="modal-date">
                  {selectedMedia.timestamp?.toLocaleDateString() || "Unknown date"}
                </span>
              </div>
              
              {selectedMedia.comments && selectedMedia.comments.length > 0 && (
                <div className="modal-comments-section">
                  <h4>Comments</h4>
                  <div className="comments-list">
                    {selectedMedia.comments.map((comment, idx) => (
                      <div key={idx} className="comment-item">
                        <span className="comment-author">{comment.userName}:</span>
                        <span className="comment-text">{comment.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isOwner && (
                <div className="modal-actions">
                  <button className="edit-media-btn">Edit</button>
                  <button className="delete-media-btn">Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Helper function to close modal
  function closeModal() {
    setSelectedMedia(null);
  }
}

export default UserProfile;