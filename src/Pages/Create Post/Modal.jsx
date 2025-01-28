import React, { useState } from "react";
import "./Modal.css";

function Modal({ isOpen, onClose, mediaDetails, onLike, onAddComment }) {
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const handleLike = () => {
    onLike(mediaDetails.id);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (comment.trim() !== "") {
      onAddComment(mediaDetails.id, comment);
      setComment(""); // Reset the comment input after submission
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>X</button>
        <h2>{mediaDetails.title}</h2>
        <p>{mediaDetails.description}</p>
        
        <div className="media-stats">
          <p><strong>Likes:</strong> {mediaDetails.likes}</p>
          <p><strong>Comments:</strong> {mediaDetails.comments.length}</p>
          <p><strong>Views:</strong> {mediaDetails.views}</p>
        </div>

        {mediaDetails.type === "post" ? (
          <img src={mediaDetails.image} alt="Post" className="modal-image" />
        ) : (
          <video src={mediaDetails.video} controls className="modal-video" />
        )}

        <div className="interaction-buttons">
          <button className="like-btn" onClick={handleLike}>
            {mediaDetails.liked ? "Unlike" : "Like"}
          </button>
          <form onSubmit={handleAddComment} className="comment-form">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
            />
            <button type="submit" className="comment-submit-btn">Post</button>
          </form>
        </div>

        <div className="comments-section">
          {mediaDetails.comments.map((cmt, index) => (
            <div key={index} className="comment">
              <strong>{cmt.author}</strong>: {cmt.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Modal;
