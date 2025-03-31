import { useState, useEffect } from "react";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from  "../../firebase/Firebase"; // Make sure this path is correct for your project
import ReelsDisplay from "../Create Post/ReelsDisiplay";
import { useNavigate } from "react-router-dom";
import ReelUpload from "../Create Post/ReelUpload";

export default function Reels() {

  // Function to navigate to the previous reel
  
  return (
    
        <>
<Reel/>
        </>
     

  );
}