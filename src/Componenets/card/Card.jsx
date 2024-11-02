import './../card/Trendcard.module.css'
import React from 'react';
import { AiOutlineLike } from "react-icons/ai";
export default function Cardion (){
    return (
        <>
        
        <div className="post-card">
      <div className="post-header">
        <div className="user-info">
          <div className="user-avatar">
            <img src="https://via.placeholder.com/50" alt="User Avatar" />
          </div>
          <div className="user-details">
            <h3>Parikshit</h3>
            <p>2 hours ago</p>
          </div>
        </div>
      </div>

      <div className="post-content">
        <p>Hyperloop.co Welcomes To Certano</p>
        <img src="data:image/jpeg;base64,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" alt="Post" className="post-image" />
      </div>

      <div className="post-footer">
        <button className="like-btn"><AiOutlineLike /></button>
        <button className="comment-btn">💬 Comment</button>
        <button className="share-btn">🔄 Share</button>
      </div>
    </div>
        
        
        
        </>
    )
}