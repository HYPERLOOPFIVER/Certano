import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/Firebase";
import {
  collection,
  query,
  getDocs,
  onSnapshot,
  where,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

// Sound notification function
const playNotificationSound = () => {
  const audio = new Audio("/path/to/notification-sound.mp3");
  audio.play();
};

const ChatSidebar = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]); // Stores the list of chatted users
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]); // Stores search results
  const [unreadMessages, setUnreadMessages] = useState({});
  const [chattedUsers, setChattedUsers] = useState(new Set()); // Track users with whom the current user has chatted

  // ✅ Fetch the list of users the current user has interacted with
  useEffect(() => {
    const fetchChattedUsers = async () => {
      try {
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, where("receiverId", "==", auth.currentUser?.uid));
        const querySnapshot = await getDocs(q);

        const chattedUserIds = querySnapshot.docs.map((doc) => doc.data().senderId);
        setChattedUsers(new Set(chattedUserIds));
      } catch (error) {
        console.error("Error fetching chatted users:", error);
      }
    };

    fetchChattedUsers();
  }, []);

  // ✅ Real-time listener for unread messages
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "messages"),
      (snapshot) => {
        let newUnreadMessages = {};
        snapshot.docs.forEach((doc) => {
          const message = doc.data();
          if (message.receiverId === auth.currentUser?.uid && !message.read) {
            newUnreadMessages[message.senderId] = true;
            playNotificationSound();
          }
        });

        setUnreadMessages(newUnreadMessages);
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // ✅ Fetch all users (for search functionality)
  const handleSearch = async (e) => {
    const queryText = e.target.value;
    setSearch(queryText);

    if (queryText.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      const searchedUsers = usersSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (user) =>
            user.id !== auth.currentUser.uid && // Exclude current user
            (user.name?.toLowerCase() || "").includes(queryText.toLowerCase()) // ✅ Fixes undefined error
        );

      setSearchResults(searchedUsers);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // ✅ Fetch and set the list of chatted users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);

        const allUsers = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.id !== auth.currentUser?.uid); // Exclude current user

        const interactedUsers = allUsers.filter((user) => chattedUsers.has(user.id));
        setUsers(interactedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [chattedUsers]);

  // ✅ Handles clicking on a user to chat
  const handleUserClick = async (user) => {
    const userMessagesRef = collection(db, "messages");
    const q = query(
      userMessagesRef,
      where("senderId", "==", user.id),
      where("receiverId", "==", auth.currentUser?.uid),
      where("read", "==", false)
    );
    const querySnapshot = await getDocs(q);

    // Mark messages as read
    querySnapshot.docs.forEach(async (messageDoc) => {
      const messageRef = doc(db, "messages", messageDoc.id);
      await updateDoc(messageRef, { read: true });
    });

    // Start a conversation if it doesn't exist
    if (querySnapshot.empty) {
      await addDoc(collection(db, "messages"), {
        senderId: auth.currentUser?.uid,
        receiverId: user.id,
        text: "Hello, let's chat!",
        timestamp: new Date(),
        read: false,
      });
    }

    onSelectUser(user);
    setChattedUsers((prev) => new Set(prev.add(user.id))); // Add to chatted users
  };

  return (
    <div className="chat-sidebar">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={handleSearch}
        className="search-bar"
      />

      {/* Show search results if there is a query */}
      {search.length > 0 ? (
        searchResults.length === 0 ? (
          <div>No users found.</div>
        ) : (
          searchResults.map((user) => (
            <div key={user.id} onClick={() => handleUserClick(user)} className="user-item">
              <div className="user-avatar-container">
                <img
                  src={user.photoURL || "https://www.kravemarketingllc.com/wp-content/uploads/2018/09/placeholder-user-500x500.png"}
                  alt={user.name || "User"}
                  className="user-avatar"
                />
                {unreadMessages[user.id] && <div className="notification-dot"></div>}
              </div>
              <p>{user.name || "Unknown User"}</p>
            </div>
          ))
        )
      ) : (
        // Show chatted users when there's no search
        users.length === 0 ? (
          <div>No recent chats.</div>
        ) : (
          users.map((user) => (
            <div key={user.id} onClick={() => handleUserClick(user)} className="user-item">
              <div className="user-avatar-container">
                <img
                  src={user.photoURL || "https://www.kravemarketingllc.com/wp-content/uploads/2018/09/placeholder-user-500x500.png"}
                  alt={user.name || "User"}
                  className="user-avatar"
                />
                {unreadMessages[user.id] && <div className="notification-dot"></div>}
              </div>
              <p>{user.name || "Unknown User"}</p>
            </div>
          ))
        )
      )}
    </div>
  );
};

export default ChatSidebar;
