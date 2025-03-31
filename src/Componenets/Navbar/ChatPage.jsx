import { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import "./chat.css";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="chat-container">
      {/* Chat Sidebar: Handle user selection */}
      <ChatSidebar onSelectUser={setSelectedUser} />
      
      {/* Display chat window for the selected user or a prompt if no user is selected */}
      {selectedUser ? (
        <ChatWindow selectedUser={selectedUser} />
      ) : (
        <div className="no-chat">Select a chat</div>
      )}
    </div>
  );
};

export default ChatPage;
