import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Componenets/Navbar/Nav";
import Home from "./Pages/Home/Home";
import Trending from "./Pages/Trending/Trending";
import Login from "./Pages/Auth/Login";
import Signup from "./Pages/Auth/signup/Signup";
import News from "./Pages/News/News";
import PostUpload from "./Pages/Create Post/Createpost";
import Reels from "./Pages/Reels/Reels";
import FetchIdeas from "./Pages/Ideas/Idea";
import PostIdea from "./Pages/ideacreate/PostIdea";
import SearchPage from "./Pages/Auth/SearchPage";
import ReelUpload from "./Pages/Create Post/ReelUpload";
import AllUsers from "./Pages/Create Post/Profiles";
import SearchUsers from "./Pages/Create Post/Searchusers";
import UserProfile from "./Pages/Create Post/UserProfile";
import ChatPage from "./Componenets/Navbar/ChatPage";
import ReelsDisplay from "./Pages/Create Post/ReelsDisiplay";

function App() {
  const currentUser = { id: "exampleId", name: "Test User" }; // Replace with actual user

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Trending" element={<Trending />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/News" element={<News />} />
        <Route path="/PostUpload" element={<PostUpload />} />
        <Route path="/Reelupload" element={<ReelsDisplay />} />
        <Route path="/Reels/:id" element={<ReelsDisplay key={window.location.pathname} />} />
        <Route path="/PostIdea" element={<PostIdea />} />
        <Route path="/Reels" element={<Reels />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/serch" element={<SearchUsers />} />
        <Route path="/profile/:userId" element={<UserProfile currentUser={currentUser} />} />
        <Route path="/FetchIdeas" element={<FetchIdeas />} />
        <Route path="/prof" element={<AllUsers />} />
      </Routes>
    </Router>
  );
}

export default App;
