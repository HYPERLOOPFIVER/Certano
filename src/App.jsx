import { useState } from 'react'
import Home from './Pages/Home/Home';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './Componenets/Navbar/Nav';
import Trending from './Pages/Trending/Trending';
import Login from './Pages/Auth/Login';
import Signup  from './Pages/Auth/signup/Signup';
import News from './Pages/News/News';
import PostUpload from './Pages/Create Post/Createpost';
import Reels from './Pages/Reels/Reels';
import FetchIdeas from './Pages/Ideas/Idea';
import PostIdea from './Pages/ideacreate/PostIdea';
import SearchPage from './Pages/Auth/SearchPage';
function App() {
 

  return (
    <Router>
    
        <Navbar/> 
        
          <Routes>
          <Route path="/" element={<Login />} />
           <Route path="/Home" element={<Home />}/>
           <Route path="/Trending" element={<Trending/>}/>
           <Route path="/search" element={<SearchPage/>}/>
          <Route path="/signup" element={<Signup />} />
          <Route path="/News" element={<News />} />
          <Route path="/PostUpload" element={<PostUpload />} />
          <Route path="/Reels" element={<Reels />} />
          <Route path="/PostIdea" element={<PostIdea />} />
          <Route path="/FetchIdeas" element={<FetchIdeas/>} />
          </Routes>
         
      </Router>
  )
}

export default App
