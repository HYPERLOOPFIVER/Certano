import React, { useState, useEffect } from 'react';
import './InstagramModal.css';

const InstagramModal = ({ 
  isOpen, 
  onClose, 
  media, 
  user, 
  isOwner, 
  onLike, 
  onComment, 
  onDelete, 
  onEdit 
}) => {
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  
  useEffect(() => {
    // Check if current user has liked the post
    setIsLiked(media?.likedBy?.includes(user?.id) || false);
    
    // Disable scrolling on body when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, media, user]);
  
  if (!isOpen || !media) return null;
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike(media.id, !isLiked);
  };
  
  const handleComment = (e) => {
    e.preventDefault();
    if (comment.trim() && onComment) {
      onComment(media.id, comment);
      setComment('');
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };
  
  return (
    <div 
      className="instagram-modal-overlay" 
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="instagram-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>×</button>
        
        <div className="modal-content">
          <div className="modal-media-section">
            {media.type === 'post' ? (
              <img 
                src={media.image} 
                alt={media.caption || "Post"} 
                className="modal-media" 
              />
            ) : (
              <video 
                src={media.video} 
                controls 
                autoPlay 
                className="modal-media" 
              />
            )}
          </div>
          
          <div className="modal-details-section">
            <div className="modal-header">
              <div className="modal-user-info">
                <img 
                  src={user?.profileImage || "/default-profile.png"} 
                  alt={user?.name || "User"} 
                  className="modal-profile-img" 
                />
                <span className="modal-username">{user?.name || "User"}</span>
              </div>
              
              {isOwner && (
                <div className="modal-actions-dropdown">
                  <button className="modal-more-options">•••</button>
                  <div className="modal-dropdown-content">
                    <button onClick={() => onEdit(media)}>Edit</button>
                    <button onClick={() => onDelete(media.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-comments-container">
              {/* Caption as first comment */}
              {media.caption && (
                <div className="modal-caption">
                  <img 
                    src={user?.profileImage || "/default-profile.png"} 
                    alt={user?.name || "User"} 
                    className="comment-profile-img" 
                  />
                  <div className="comment-content">
                    <span className="comment-username">{user?.name || "User"}</span>
                    <span className="comment-text">{media.caption}</span>
                  </div>
                </div>
              )}
              
              {/* Comments */}
              <div className="modal-comments-list">
                {media.comments && media.comments.length > 0 ? (
                  media.comments.map((comment, idx) => (
                    <div key={idx} className="modal-comment">
                      <img 
                        src={comment.userImage || "/default-profile.png"} 
                        alt={comment.userName} 
                        className="comment-profile-img" 
                      />
                      <div className="comment-content">
                        <span className="comment-username">{comment.userName}</span>
                        <span className="comment-text">{comment.text}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-comments">No comments yet</div>
                )}
              </div>
            </div>
            
            <div className="modal-interaction-section">
              <div className="modal-actions">
                <button 
                  className={`action-button like-button ${isLiked ? 'liked' : ''}`}
                  onClick={handleLike}
                >
                  {isLiked ? (
                    <svg aria-label="Unlike" color="#ed4956" fill="#ed4956" height="24" role="img" viewBox="0 0 48 48">
                      <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                    </svg>
                  ) : (
                    <svg aria-label="Like" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24">
                      <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                    </svg>
                  )}
                </button>
                
                <button className="action-button comment-button">
                  <svg aria-label="Comment" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24">
                    <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </button>
                
                <button className="action-button share-button">
                  <svg aria-label="Share Post" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24">
                    <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
                    <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon>
                  </svg>
                </button>
                
                <button className="action-button save-button">
                  <svg aria-label="Save" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24">
                    <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                  </svg>
                </button>
              </div>
              
              <div className="modal-likes-count">
                {media.likes?.length > 0 ? (
                  <span>{media.likes.length} likes</span>
                ) : (
                  <span>Be the first to like this</span>
                )}
              </div>
              
              <div className="modal-post-time">
                {media.timestamp ? (
                  <span>{new Date(media.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                ) : (
                  <span>Recently</span>
                )}
              </div>
              
              <form className="modal-add-comment" onSubmit={handleComment}>
                <div className="emoji-button">
                  <svg aria-label="Emoji" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24">
                    <path d="M15.83 10.997a1.167 1.167 0 1 0 1.167 1.167 1.167 1.167 0 0 0-1.167-1.167Zm-6.5 1.167a1.167 1.167 0 1 0-1.166 1.167 1.167 1.167 0 0 0 1.166-1.167Zm5.163 3.24a3.406 3.406 0 0 1-4.982.007 1 1 0 1 0-1.557 1.256 5.397 5.397 0 0 0 8.09 0 1 1 0 0 0-1.55-1.263ZM12 .503a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12 .503Zm0 21a9.5 9.5 0 1 1 9.5-9.5 9.51 9.51 0 0 1-9.5 9.5Z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button 
                  type="submit" 
                  className={`post-comment-button ${!comment.trim() ? 'disabled' : ''}`}
                  disabled={!comment.trim()}
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramModal;