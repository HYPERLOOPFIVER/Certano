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
  const { userId } = useParams(); // Get the profile user ID from the URL
  const [user, setUser] = useState(null); // Profile user data
  const [currentUser, setCurrentUser] = useState(null); // Logged-in user data
  const [isFollowing, setIsFollowing] = useState(false);
  const [media, setMedia] = useState([]); // Combined posts and reels
  const [selectedMedia, setSelectedMedia] = useState(null); // Selected media for modal
  const navigate = useNavigate(); // For navigation (replace useHistory with useNavigate)

  // Fetch the logged-in user's data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser({
          id: user.uid,
          email: user.email,
          name: user.displayName || "Unknown User",
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch the profile user's data
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !currentUser?.id) return;

      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser(userSnap.data());
          setIsFollowing(userSnap.data().followers?.includes(currentUser.id));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, [userId, currentUser?.id]);

  // Fetch posts and reels by user ID
  useEffect(() => {
    const fetchPostsAndReels = async () => {
      if (!userId) return;

      try {
        console.log("Fetching posts and reels for user:", userId);

        // Fetch posts where uid matches userId
        const postsQuery = query(
          collection(db, "posts"),
          where("uid", "==", userId)
        );
        const postsSnap = await getDocs(postsQuery);
        const postsData = postsSnap.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          type: "post", // Add type for distinguishing
        }));

        console.log("Fetched posts:", postsData);

        // Fetch reels where uid matches userId
        const reelsQuery = query(
          collection(db, "reels"),
          where("uid", "==", userId)
        );
        const reelsSnap = await getDocs(reelsQuery);
        const reelsData = reelsSnap.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          type: "reel", // Add type for distinguishing
        }));

        console.log("Fetched reels:", reelsData);

        // Combine posts and reels
        setMedia([...postsData, ...reelsData]);
      } catch (error) {
        console.error("Error fetching posts and reels:", error);
      }
    };

    fetchPostsAndReels();
  }, [userId]);

  // Handle follow/unfollow logic
  const handleFollow = async () => {
    if (!userId || !currentUser?.id) return;

    const userRef = doc(db, "users", userId);
    const currentUserRef = doc(db, "users", currentUser.id);

    try {
      const [userSnap, currentUserSnap] = await Promise.all([getDoc(userRef), getDoc(currentUserRef)]);

      if (!userSnap.exists() || !currentUserSnap.exists()) {
        console.error("User or Current User document does not exist");
        return;
      }

      if (isFollowing) {
        await updateDoc(userRef, { followers: arrayRemove(currentUser.id) });
        await updateDoc(currentUserRef, { following: arrayRemove(userId) });
      } else {
        await updateDoc(userRef, { followers: arrayUnion(currentUser.id) });
        await updateDoc(currentUserRef, { following: arrayUnion(userId) });
      }

      const updatedUserSnap = await getDoc(userRef);
      if (updatedUserSnap.exists()) {
        setUser(updatedUserSnap.data());
        setIsFollowing(updatedUserSnap.data().followers?.includes(currentUser.id));
      }
    } catch (error) {
      console.error("Error updating follow state:", error);
    }
  };

  // Handle checking if a chat room exists or create one
  const handleChat = async () => {
    if (!userId || !currentUser?.id) return;

    try {
      // Query to check if the chat room already exists with the two users
      const chatRoomRef = collection(db, "chatRooms");
      const q = query(
        chatRoomRef,
        where("users", "array-contains", currentUser.id),
        where("users", "array-contains", userId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If chat room exists, navigate to the chat room
        const chatRoomId = querySnapshot.docs[0].id;
        navigate(`/chat/${chatRoomId}`); // Replace history.push with navigate
      } else {
        // If no chat room, create a new one
        const newChatRoomRef = doc(chatRoomRef);
        await setDoc(newChatRoomRef, {
          users: [currentUser.id, userId],
          messages: [],
        });

        // Add the new chat to the current user's sidebar chat list
        const currentUserRef = doc(db, "users", currentUser.id);
        await updateDoc(currentUserRef, {
          chatRooms: arrayUnion(newChatRoomRef.id),
        });

        // Add the new chat to the profile user's sidebar chat list as well
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          chatRooms: arrayUnion(newChatRoomRef.id),
        });

        navigate(`/chat/${newChatRoomRef.id}`); // Navigate to the newly created chat room
      }
    } catch (error) {
      console.error("Error handling chat:", error);
    }
  };

  // Handle selecting media item to view in modal
  const handleMediaClick = (item) => {
    setSelectedMedia(item);
  };

  // Close the modal
  const closeModal = () => {
    setSelectedMedia(null);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="user-profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-image-container">
            <img
              src={user.profileImage || "/default-profile.png"}
              alt="Profile"
              className="profile-image"
            />
          </div>
          <div className="profile-info">
            <h2>{user.name}</h2>
            <p>{user.bio || "This user has no bio"}</p>
            <div className="follow-info">
              <span>
                <strong>{user.followers?.length || 0}</strong> Followers
              </span>
              <span>
                <strong>{user.following?.length || 0}</strong> Following
              </span>
            </div>
            <button
              className={`follow-btn ${isFollowing ? "unfollow" : "follow"}`}
              onClick={handleFollow}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
            <button className="chat-btn" onClick={handleChat}>
              Chat
            </button>
          </div>
        </div>

        <div className="profile-content">
          <h3>Posts & Reels</h3>
          <div className="media-gallery">
            <div className="media-grid">
              {media.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMediaClick(item)}
                  className="media-item"
                >
                  {item.type === "post" ? (
                    <img src={item.image} alt="Post" />
                  ) : (
                    <video src={item.video} controls />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal to show details */}
      {selectedMedia && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={closeModal}>
              &times;
            </button>
            <h2>{selectedMedia.title || "No Title"}</h2>
            <p>{selectedMedia.description || "No Description"}</p>
            <div className="media-details">
              <span><strong>Likes:</strong> {selectedMedia.likes || 0}</span>
              <span><strong>Comments:</strong> {selectedMedia.comments?.length || 0}</span>
            </div>
            {selectedMedia.type === "post" && (
              <img src={selectedMedia.image} alt="Post Details" />
            )}
            {selectedMedia.type === "reel" && (
              <video src={selectedMedia.video} controls />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
