import React, { useEffect, useState } from 'react';
import { db, storage } from '../../firebase/Firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { LiaCommentDotsSolid, LiaHeartSolid, LiaBookmarkSolid, LiaEllipsisHSolid, LiaShareSolid } from "react-icons/lia";
import { FiSend, FiSearch, FiTrendingUp, FiHome, FiUser, FiBell, FiPlus, FiX } from "react-icons/fi";
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import styles from './Post.module.css';

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState({});
  const [showMore, setShowMore] = useState({});
  const [filter, setFilter] = useState('');
  const [followedUsers, setFollowedUsers] = useState([]);
  const [userLikes, setUserLikes] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'following', 'trending'
  const [stories, setStories] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [storyFile, setStoryFile] = useState(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Fetch real stories from Firestore
  const fetchStories = async () => {
    try {
      const storiesCollection = collection(db, 'stories');
      const storiesQuery = query(storiesCollection, orderBy('createdAt', 'desc'));
      const storiesSnapshot = await getDocs(storiesQuery);
      
      const storiesList = storiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        hasUnreadStory: true // Default to true for demo purposes
      }));
      
      setStories(storiesList);
    } catch (error) {
      console.error('Error fetching stories: ', error);
    }
  };

  // Fetch real notifications from Firestore
  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    try {
      const notificationsCollection = collection(db, 'notifications');
      const notificationsQuery = query(
        notificationsCollection,
        where('recipientId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const notificationsSnapshot = await getDocs(notificationsQuery);
      
      const notificationsList = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().createdAt ? formatTimestamp(doc.data().createdAt) : 'Just now'
      }));
      
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error fetching notifications: ', error);
    }
  };

  useEffect(() => {
    fetchStories();
    fetchNotifications();
    
    // Fallback to mock data if no stories are found
    const mockStories = [
      { id: 1, username: 'user1', avatar: 'https://via.placeholder.com/60', hasUnreadStory: true },
      { id: 2, username: 'user2', avatar: 'https://via.placeholder.com/60', hasUnreadStory: true },
      { id: 3, username: 'user3', avatar: 'https://via.placeholder.com/60', hasUnreadStory: false },
      { id: 4, username: 'user4', avatar: 'https://via.placeholder.com/60', hasUnreadStory: true },
      { id: 5, username: 'user5', avatar: 'https://via.placeholder.com/60', hasUnreadStory: false },
      { id: 6, username: 'user6', avatar: 'https://via.placeholder.com/60', hasUnreadStory: true },
      { id: 7, username: 'user7', avatar: 'https://via.placeholder.com/60', hasUnreadStory: true },
      { id: 8, username: 'user8', avatar: 'https://via.placeholder.com/60', hasUnreadStory: false },
    ];
    
    const mockNotifications = [
      { id: 1, type: 'like', username: 'user1', content: 'liked your post', time: '2h ago' },
      { id: 2, type: 'comment', username: 'user2', content: 'commented on your post', time: '4h ago' },
      { id: 3, type: 'follow', username: 'user3', content: 'started following you', time: '1d ago' },
      { id: 4, type: 'mention', username: 'user4', content: 'mentioned you in a comment', time: '2d ago' },
    ];
    
    // Use mock data if no real data was fetched
    setTimeout(() => {
      if (stories.length === 0) setStories(mockStories);
      if (notifications.length === 0 && currentUser) setNotifications(mockNotifications);
    }, 1000);
  }, [currentUser]);

  const fetchFollowedUsers = async () => {
    if (!currentUser) return;
  
    try {
      const followingCollection = collection(db, `users/${currentUser.uid}/following`);
      const followingSnapshot = await getDocs(followingCollection);
      const followedUsersList = followingSnapshot.docs.map(doc => doc.id);
      setFollowedUsers(followedUsersList);
    } catch (error) {
      setError('Error fetching followed users: ' + error.message);
    }
  };

  const shuffleArray = (array) => {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  const fetchPosts = async () => {
    try {
      const postsCollection = collection(db, 'posts');
      let postsQuery;
      
      if (activeFilter === 'following' && followedUsers.length > 0) {
        postsQuery = query(postsCollection, where('uid', 'in', followedUsers.slice(0, 10)));
      } else if (activeFilter === 'trending') {
        // In a real app, you'd have a ranking algorithm. Here we're just simulating
        postsQuery = query(postsCollection, orderBy('createdAt', 'desc'), limit(10));
      } else {
        postsQuery = postsCollection;
      }
      
      const postsSnapshot = await getDocs(postsQuery);
      const postsList = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        title: doc.data().title || '',
        description: doc.data().description || ''
      }));

      // Different sorting based on active filter
      let sortedPosts;
      if (activeFilter === 'trending') {
        // Sort by likes count (if you had that data)
        sortedPosts = postsList;
      } else if (activeFilter === 'following') {
        sortedPosts = postsList.sort((a, b) => 
          (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0)
        );
      } else {
        sortedPosts = shuffleArray(postsList);
      }
      
      setPosts(sortedPosts);
      
      // Fetch likes for posts
      await fetchLikes(postsList.map(post => post.id));
      // Fetch saved posts
      await fetchSavedPosts(postsList.map(post => post.id));
    } catch (error) {
      setError('Error fetching posts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikes = async (postIds) => {
    if (!currentUser || postIds.length === 0) return;

    try {
      // Initialize like counts for all posts
      const initialLikeCounts = {};
      postIds.forEach(postId => {
        initialLikeCounts[postId] = 0;
      });

      // Get all likes from the likePosts collection
      const likesCollection = collection(db, 'likePosts');
      const likesSnapshot = await getDocs(likesCollection);
      
      // Track which posts the current user has liked
      const userLikedPosts = {};
      
      // Count likes for each post
      likesSnapshot.docs.forEach(doc => {
        const likeData = doc.data();
        if (likeData.postId && postIds.includes(likeData.postId)) {
          // Increment the like count for this post
          initialLikeCounts[likeData.postId] = (initialLikeCounts[likeData.postId] || 0) + 1;
          
          // Check if this like is from the current user
          if (likeData.userId === currentUser.uid) {
            userLikedPosts[likeData.postId] = true;
          }
        }
      });
      
      setLikeCounts(initialLikeCounts);
      setUserLikes(userLikedPosts);
    } catch (error) {
      console.error('Error fetching likes: ', error);
    }
  };

  const fetchSavedPosts = async (postIds) => {
    if (!currentUser || postIds.length === 0) return;

    try {
      const userSavedRef = collection(db, `users/${currentUser.uid}/saved`);
      const savedSnapshot = await getDocs(userSavedRef);
      
      const savedPostsObj = {};
      savedSnapshot.docs.forEach(doc => {
        if (postIds.includes(doc.id)) {
          savedPostsObj[doc.id] = true;
        }
      });
      
      setSavedPosts(savedPostsObj);
    } catch (error) {
      console.error('Error fetching saved posts: ', error);
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser) {
      // Prompt user to sign in
      alert("Please sign in to like posts");
      return;
    }
    
    try {
      const userId = currentUser.uid;
      const likeId = `${postId}_${userId}`;
      const likeRef = doc(db, 'likePosts', likeId);
      const likeDoc = await getDoc(likeRef);
      
      if (likeDoc.exists()) {
        // User already liked this post, so unlike it
        await deleteDoc(likeRef);
        
        setLikeCounts(prev => ({
          ...prev,
          [postId]: Math.max(0, (prev[postId] || 0) - 1)
        }));
        
        setUserLikes(prev => {
          const updated = { ...prev };
          delete updated[postId];
          return updated;
        });
      } else {
        // User hasn't liked this post yet, so like it
        await setDoc(likeRef, {
          postId,
          userId,
          createdAt: serverTimestamp()
        });
        
        setLikeCounts(prev => ({
          ...prev,
          [postId]: (prev[postId] || 0) + 1
        }));
        
        setUserLikes(prev => ({
          ...prev,
          [postId]: true
        }));
      }
    } catch (error) {
      console.error('Error toggling like: ', error);
    }
  };

  const handleSave = async (postId) => {
    if (!currentUser) {
      alert("Please sign in to save posts");
      return;
    }
    
    try {
      const saveRef = doc(db, `users/${currentUser.uid}/saved`, postId);
      const saveDoc = await getDoc(saveRef);
      
      if (saveDoc.exists()) {
        // User already saved this post, so unsave it
        await deleteDoc(saveRef);
        
        setSavedPosts(prev => {
          const updated = { ...prev };
          delete updated[postId];
          return updated;
        });
      } else {
        // User hasn't saved this post yet, so save it
        await setDoc(saveRef, {
          savedAt: serverTimestamp()
        });
        
        setSavedPosts(prev => ({
          ...prev,
          [postId]: true
        }));
      }
    } catch (error) {
      console.error('Error toggling save: ', error);
    }
  };

  const handleCommentSubmit = async (e, post) => {
    e.preventDefault();
    if (!comment.trim() || !currentUser) {
      if (!currentUser) alert("Please sign in to comment");
      return;
    }
    
    try {
      await addDoc(collection(db, 'comments'), {
        postId: post.id,
        commentText: comment.trim(),
        commentBy: currentUser.displayName || currentUser.email || currentUser.uid,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      setComment('');
      setSelectedPost(null);
      fetchComments();
    } catch (error) {
      console.error('Error adding comment: ', error);
    }
  };

  const fetchComments = async () => {
    if (posts.length > 0) {
      try {
        const commentsCollection = collection(db, 'comments');
        const commentsSnapshot = await getDocs(commentsCollection);

        const commentsList = {};
        commentsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const postId = data.postId;
          if (!commentsList[postId]) {
            commentsList[postId] = [];
          }
          commentsList[postId].push({ id: doc.id, ...data });
        });
        
        // Sort comments by timestamp
        Object.keys(commentsList).forEach(postId => {
          commentsList[postId].sort((a, b) => {
            const timeA = a.createdAt ? a.createdAt.toDate() : new Date(0);
            const timeB = b.createdAt ? b.createdAt.toDate() : new Date(0);
            return timeB - timeA;
          });
        });
        
        setComments(commentsList);
      } catch (error) {
        console.error('Error fetching comments: ', error);
      }
    }
  };

  useEffect(() => {
    fetchFollowedUsers();
  }, [currentUser]);
  
  useEffect(() => {
    fetchPosts();
  }, [followedUsers, activeFilter]);

  useEffect(() => {
    if (posts.length > 0) {
      fetchComments();
    }
  }, [posts]);

  const toggleShowMore = (postId) => {
    setShowMore((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setShowFilters(false);
  };

  const handleShare = (postId) => {
    navigator.clipboard.writeText(`https://yourwebsite.com/post/${postId}`);
    alert('Link copied to clipboard!');
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setStoryFile(e.target.files[0]);
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("Please sign in to create a story");
      return;
    }
    
    if (!storyFile) {
      alert("Please select an image or video for your story");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `stories/${currentUser.uid}/${Date.now()}_${storyFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, storyFile);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading file: ', error);
          alert('Error uploading file');
          setIsUploading(false);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Add story to Firestore
          await addDoc(collection(db, 'stories'), {
            userId: currentUser.uid,
            username: currentUser.displayName || currentUser.email || currentUser.uid,
            userAvatar: currentUser.photoURL || "https://via.placeholder.com/60",
            mediaUrl: downloadURL,
            caption: storyCaption,
            fileType: storyFile.type.startsWith('video') ? 'video' : 'image',
            createdAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
          });
          
          // Reset form and close modal
          setStoryFile(null);
          setStoryCaption('');
          setUploadProgress(0);
          setIsUploading(false);
          setShowCreateStoryModal(false);
          
          // Refresh stories
          fetchStories();
        }
      );
    } catch (error) {
      console.error('Error creating story: ', error);
      alert('Error creating story');
      setIsUploading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    (post.title && post.title.toLowerCase().includes(filter.toLowerCase())) ||
    (post.description && post.description.toLowerCase().includes(filter.toLowerCase()))
  );

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const postTime = timestamp.toDate ? timestamp.toDate() : timestamp;
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return postTime.toLocaleDateString();
  };

  const handleViewStory = (story) => {
    // In a real app, navigate to a story viewer component
    alert(`Viewing ${story.username || story.userId}'s story`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading premium content...</p>
      </div>
    );
  }

  if (error) {
    return <p className={styles.errorText}>{error}</p>;
  }

  return (
    <div className={styles.mainContainer} style={{ backgroundColor: 'black', color: 'white' }}>
      {/* Header with brand name */}
      <header className={styles.header}>
        <div className={styles.brandLogo}>
          <h1 className={styles.brandName}>LightUpSwift</h1>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.iconButton} 
            onClick={() => setShowSearch(!showSearch)}
          >
            <FiSearch size={24} />
          </button>
          <button 
            className={styles.iconButton} 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FiBell size={24} />
            {notifications.length > 0 && (
              <span className={styles.notificationBadge}>{notifications.length}</span>
            )}
          </button>
        </div>
      </header>
      
      {/* Search bar (conditionally rendered) */}
      {showSearch && (
        <div className={styles.searchContainer}>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search posts..."
            className={styles.searchInput}
          />
        </div>
      )}
      
      {/* Notifications panel (conditionally rendered) */}
      {showNotifications && (
        <div className={styles.notificationsPanel}>
          <h3 className={styles.notificationHeader}>Notifications</h3>
          {notifications.length === 0 ? (
            <p className={styles.noNotifications}>No new notifications</p>
          ) : (
            notifications.map(notification => (
              <div key={notification.id} className={styles.notificationItem}>
                <img 
                  src={notification.senderAvatar || "https://via.placeholder.com/32"} 
                  alt={notification.username || notification.senderId} 
                  className={styles.notificationAvatar} 
                />
                <div className={styles.notificationContent}>
                  <p>
                    <strong>{notification.username || notification.senderId}</strong> {notification.content}
                  </p>
                  <span className={styles.notificationTime}>{notification.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Content filters */}
      <div className={styles.filterContainer}>
        <button 
          className={`${styles.filterButton} ${activeFilter === 'all' ? styles.activeFilter : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          <FiHome size={16} />
          <span>For You</span>
        </button>
        <button 
          className={`${styles.filterButton} ${activeFilter === 'following' ? styles.activeFilter : ''}`}
          onClick={() => handleFilterChange('following')}
        >
          <FiUser size={16} />
          <span>Following</span>
        </button>
        <button 
          className={`${styles.filterButton} ${activeFilter === 'trending' ? styles.activeFilter : ''}`}
          onClick={() => handleFilterChange('trending')}
        >
          <FiTrendingUp size={16} />
          <span>Trending</span>
        </button>
      </div>

      {/* Stories Section (Instagram-like) */}
      <div className={styles.storiesContainer}>
        <div className={styles.storyItem}>
          <div 
            className={styles.yourStory}
            onClick={() => setShowCreateStoryModal(true)}
          >
            <div className={styles.addStoryButton}>
              <FiPlus size={20} />
            </div>
            <img 
              src={currentUser?.photoURL || "https://via.placeholder.com/60"} 
              alt="Your Story" 
              className={styles.storyAvatar} 
            />
          </div>
          <span className={styles.storyUsername}>Your Story</span>
        </div>
        
        {stories.map(story => (
          <div key={story.id} className={styles.storyItem} onClick={() => handleViewStory(story)}>
            <div className={`${styles.storyRing} ${story.hasUnreadStory ? styles.unreadStory : ''}`}>
              <img 
                src={story.userAvatar || story.avatar || "https://via.placeholder.com/60"} 
                alt={story.username || story.userId} 
                className={styles.storyAvatar} 
              />
            </div>
            <span className={styles.storyUsername}>{story.username || story.userId}</span>
          </div>
        ))}
      </div>

      {/* Posts Section */}
      <div className={styles.postsContainer}>
        {filteredPosts.length === 0 ? (
          <div className={styles.noPosts}>
            <p>No posts found. {activeFilter === 'following' ? 'Follow some users to see their posts here.' : 'Try a different filter or search term.'}</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className={styles.postCard}>
              {/* Post Header */}
              <div className={styles.postHeader}>
                <div className={styles.postUser}>
                  <img src="https://via.placeholder.com/32" alt={post.uid} className={styles.userAvatar} />
                  <Link to={`/profile/${post.uid}`} className={styles.username}>{post.uid}</Link>
                  <span className={styles.postTimestampSmall}>
                    • {post.createdAt ? formatTimestamp(post.createdAt) : 'RECENTLY'}
                  </span>
                </div>
                <button className={styles.postOptions}>
                  <LiaEllipsisHSolid />
                </button>
              </div>

              {/* Post Title (if available) */}
              {post.title && (
                <div className={styles.postTitle}>
                  <h3>{post.title}</h3>
                </div>
              )}

              {/* Post Image */}
              {post.image && (
                <div className={styles.postImageContainer}>
                  <img src={post.image} alt={post.title || 'Post'} className={styles.postImage} />
                </div>
              )}

              {/* Post Actions */}
              <div className={styles.postActions}>
                <div className={styles.leftActions}>
                  <button 
                    onClick={() => handleLike(post.id)} 
                    className={`${styles.actionButton} ${userLikes[post.id] ? styles.likedButton : ''}`}
                  >
                    <LiaHeartSolid />
                  </button>
                  <button className={styles.actionButton}>
                    <LiaCommentDotsSolid />
                  </button>
                  <button 
                    className={styles.actionButton}
                    onClick={() => handleShare(post.id)}
                  >
                    <LiaShareSolid />
                  </button>
                </div>
                <button 
                  className={`${styles.saveButton} ${savedPosts[post.id] ? styles.savedButton : ''}`}
                  onClick={() => handleSave(post.id)}
                >
                  <LiaBookmarkSolid />
                </button>
              </div>

              {/* Likes */}
              <div className={styles.postLikes}>
                {likeCounts[post.id] || 0} likes
              </div>

              {/* Caption */}
              <div className={styles.postCaption}>
                <Link to={`/profile/${post.uid}`} className={styles.username}>{post.uid}</Link>
                <span className={styles.captionText}>
                  {post.description && post.description.length > 150 && !showMore[`caption_${post.id}`] ? (
                    <>
                      {post.description.substring(0, 150)}...
                      <button 
                        onClick={() => setShowMore(prev => ({...prev, [`caption_${post.id}`]: true}))} 
                        className={styles.moreButton}
                      >
                        more
                      </button>
                    </>
                  ) : (
                    post.description
                  )}
                </span>
              </div>

              {/* Comments */}
              {comments[post.id] && comments[post.id].length > 0 && (
                <div className={styles.postComments}>
                  {comments[post.id].length > 2 && !showMore[post.id] && (
                    <button 
                      onClick={() => toggleShowMore(post.id)} 
                      className={styles.viewComments}
                    >
                      View all {comments[post.id].length} comments
                    </button>
                  )}
                  
                  {(showMore[post.id] ? comments[post.id] : comments[post.id].slice(0, 2)).map((comment) => (
                    <div key={comment.id} className={styles.comment}>
                      <Link to={`/profile/${comment.userId}`} className={styles.username}>{comment.commentBy}</Link>
                      <span className={styles.commentText}>{comment.commentText}</span>
                      <div className={styles.commentActions}>
                        <span className={styles.commentTime}>
                          {comment.createdAt ? formatTimestamp(comment.createdAt) : 'Just now'}
                        </span>
                        <button className={styles.replyButton}>Reply</button>
                      </div>
                    </div>
                  ))}
                  
                  {showMore[post.id] && comments[post.id].length > 5 && (
                    <button 
                      onClick={() => toggleShowMore(post.id)} 
                      className={styles.hideComments}
                    >
                      Hide comments
                    </button>
                  )}
                </div>
              )}

              {/* Timestamp for desktop */}
              <div className={styles.postTimestamp}>
                {post.createdAt ? formatTimestamp(post.createdAt) : 'RECENTLY'}
              </div>

              {/* Add Comment */}
              <form onSubmit={(e) => handleCommentSubmit(e, post)} className={styles.addComment}>
                <input
                  type="text"
                  value={selectedPost === post.id ? comment : ''}
                  onClick={() => setSelectedPost(post.id)}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className={styles.commentInput}
                />
                <button 
                  type="submit" 
                  disabled={!comment.trim() || !currentUser} 
                  className={styles.postButton}
                >
                  Post
                </button>
              </form>
            </div>
          ))
        )}
      </div>
      
      {/* Fixed bottom navigation */}
      <div className={styles.bottomNav}>
        <button className={styles.navButton} onClick={() => navigate('/')}>
          <FiHome size={24} />
        </button>
        <button className={styles.navButton} onClick={() => setShowSearch(!showSearch)}>
          <FiSearch size={24} />
        </button>
        <button className={styles.navButton}>
          <FiPlus size={24} />
        </button>
        <button className={styles.navButton} onClick={() => setShowNotifications(!showNotifications)}>
          <FiBell size={24} />
        </button>
        <button className={styles.navButton} onClick={() => navigate('/profile')}>
          <FiUser size={24} />
        </button>
      </div>
    </div>
  );
};

export default Post;