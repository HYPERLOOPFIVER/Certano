import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/Firebase";
import { collection, query, getDocs, onSnapshot, where, addDoc } from "firebase/firestore";

// Sound notification
const playNotificationSound = () => {
  const audio = new Audio("/path/to/notification-sound.mp3");  // Ensure this path is correct
  audio.play();
};

const ChatSidebar = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]); // Stores the list of users the current user has interacted with
  const [search, setSearch] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({});
  const [chattedUsers, setChattedUsers] = useState(new Set()); // To track users with whom the current user has chatted

  useEffect(() => {
    const fetchChattedUsers = async () => {
      try {
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, where("receiverId", "==", auth.currentUser?.uid));
        const querySnapshot = await getDocs(q);

        // Get user IDs of the users the current user has chatted with
        const chattedUserIds = querySnapshot.docs.map((doc) => doc.data().senderId);
        setChattedUsers(new Set(chattedUserIds));  // Store the chatted user IDs in state
      } catch (error) {
        console.error("Error fetching chatted users:", error);
      }
    };

    fetchChattedUsers();
  }, []);  // This effect runs only once when the component mounts

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

    return () => unsubscribe(); // Clean up listener when the component is unmounted
  }, []);

  const handleUserClick = async (user) => {
    const userMessagesRef = collection(db, "messages");
    const q = query(
      userMessagesRef, 
      where("senderId", "==", user.id), 
      where("receiverId", "==", auth.currentUser?.uid), 
      where("read", "==", false)
    );
    const querySnapshot = await getDocs(q);

    // Mark messages as read if there are unread ones
    querySnapshot.docs.forEach(async (messageDoc) => {
      const messageRef = doc(db, "messages", messageDoc.id);
      await updateDoc(messageRef, { read: true });
    });

    // If this is the first message with this user, initiate a new conversation
    if (querySnapshot.empty) {
      // Create a message document to initiate the conversation (this will be the first message)
      await addDoc(collection(db, "messages"), {
        senderId: auth.currentUser?.uid,
        receiverId: user.id,
        text: "Hello, let's chat!", // This can be any default or first message
        timestamp: new Date(),
        read: false,
      });
    }

    // Set the active user to the selected user
    onSelectUser(user);
    setChattedUsers((prev) => new Set(prev.add(user.id)));  // Add to chatted users
  };

  const handleSearch = async (e) => {
    setSearch(e.target.value);
  };

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

        // Only show the users with whom the current user has chatted
        const filteredUsers = allUsers.filter((user) => chattedUsers.has(user.id));

        // If the user is typing a search query, show the results based on the query
        const filteredAndSearchedUsers = filteredUsers.filter((user) =>
          user.name.toLowerCase().includes(search.toLowerCase())
        );

        setUsers(filteredAndSearchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [chattedUsers, search]); // Re-fetch users when the chat history or search query changes

  return (
    <div className="chat-sidebar">
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={handleSearch}
        className="search-bar"
      />

      {/* If the search query does not match any users, show a no result message */}
      {users.length === 0 && search && <div>No users found with the search criteria.</div>}
      
      {/* Render filtered users (those the current user has chatted with) */}
      {users.map((user) => (
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
      ))}
    </div>
  );
};

export default ChatSidebar;
