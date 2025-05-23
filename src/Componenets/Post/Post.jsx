import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/Firebase'; // Import Firestore instance
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'; // Firestore functions
import { LiaCommentDotsSolid } from "react-icons/lia";
import { Link } from 'react-router-dom'; // Import Link for navigation
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication
import styles from './Post.module.css'; // Import CSS module

const Post = () => {
  const [posts, setPosts] = useState([]); // State to store posts
  const [loading, setLoading] = useState(true); // State to handle loading status
  const [error, setError] = useState(''); // State to handle any errors
  const [comment, setComment] = useState(''); // State for comment text
  const [selectedPost, setSelectedPost] = useState(null); // Track which post comment is for
  const [comments, setComments] = useState({}); // State to store comments for each post
  const [showMore, setShowMore] = useState({}); // Track which posts are expanded
  const [filter, setFilter] = useState(''); // State for filter input
  const [followedUsers, setFollowedUsers] = useState([]); // State to store followed users

  const auth = getAuth(); // Firebase Authentication

  // Fetch followed users from the "following" subcollection
  const fetchFollowedUsers = async () => {
    const currentUser = auth.currentUser?.uid; // Get the current user's UID
    if (!currentUser) return;
  
    try {
      const followingCollection = collection(db, `users/${currentUser}/following`);
      const followingSnapshot = await getDocs(followingCollection);
      const followedUsersList = followingSnapshot.docs.map(doc => doc.id); // Get followed user IDs
      setFollowedUsers(followedUsersList); // Set followed users in state
    } catch (error) {
      setError('Error fetching followed users: ' + error.message);
    }
  };
  

  // Shuffle function to randomize the posts order
  const shuffleArray = (array) => {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  // Fetch posts from Firestore
  const fetchPosts = async () => {
    try {
      const postsCollection = collection(db, 'posts'); // Get reference to "posts" collection
      const postsSnapshot = await getDocs(postsCollection); // Fetch all documents from the collection
      const postsList = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Shuffle the posts before setting them in state
      const shuffledPosts = shuffleArray(postsList);
      setPosts(shuffledPosts); // Set the shuffled posts in state
    } catch (error) {
      setError('Error fetching posts: ' + error.message);
    } finally {
      setLoading(false); // Stop the loading spinner
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e, post) => {
    e.preventDefault();
    if (!comment.trim()) return; // Prevent empty comments
    try {
      // Create a comment document in the Firestore "comments" collection
      await addDoc(collection(db, 'comments'), {
        postId: post.id,                  // Associate comment with the correct post
        commentText: comment.trim(),      // Comment entered by the user
        commentBy: "User",                // Replace this with actual user data
        createdAt: serverTimestamp(),     // Timestamp
      });

      // Clear the comment field and update comments immediately
      setComment('');                    // Reset the comment text
      setSelectedPost(null);             // Deselect post
      fetchComments();                   // Re-fetch comments for the updated post
    } catch (error) {
      console.error('Error adding comment: ', error);  // Log any errors
    }
  };

  // Fetch comments for each post when posts are loaded
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
        setComments(commentsList);
      } catch (error) {
        console.error('Error fetching comments: ', error.message);
      }
    }
  };

  // Fetch comments when posts change
  useEffect(() => {
    fetchFollowedUsers(); // Fetch followed users on mount
    fetchPosts(); // Fetch posts when the component mounts
  }, []); // Fetch posts and followed users when the component mounts

  // Toggle show more/less for a specific post
  const toggleShowMore = (postId) => {
    setShowMore((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Filter posts based on the filter input
  const filteredPosts = posts.filter(post =>
    (post.title && post.title.toLowerCase().includes(filter.toLowerCase())) ||
    (post.description && post.description.toLowerCase().includes(filter.toLowerCase()))
  );

  // Loading and error states
  if (loading) {
    return <p className={styles.loadingText}>Loading posts...</p>;
  }

  if (error) {
    return <p className={styles.errorText}>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Feed</h2>

      {/* Followed Users Section */}
      <div className={styles.followedUsersSection}>
        <h3>Followed Users</h3>
        <div className={styles.followedUsers}>
          {followedUsers.length === 0 ? (
            <p>No followed users</p>
          ) : (
            followedUsers.map((userId) => (
              <Link key={userfollowing} to={`/profile/${userId}`} className={styles.followedUser}>
                {reels.following}
              </Link>
            ))
          )}
        </div>
      </div>

      <input
        type="text"
        placeholder="Search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)} // Update filter on input change
        className={styles.filterInput} // Add a CSS class for styling
      />

      {filteredPosts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        <div className={styles.postGrid}>
          {filteredPosts.map((post) => (
            <div key={post.id} className={styles.postItem}>
              <h3 className={styles.postTitle}>{post.title}</h3>
              <p className={styles.postDescription}>{post.description}</p>
              {post.image && (
                <img src={post.image} alt={post.title} className={styles.postImage} />
              )}
              <span className={styles.userInfo}>
                Posted by{" "}
                <Link to={`/profile/${post.uid}`} className={styles.userLink}>
                  {post.uid}
                </Link>
              </span>
              <form onSubmit={(e) => handleCommentSubmit(e, post)} className={styles.commentForm}>
                <textarea
                  value={selectedPost === post.id ? comment : ''}
                  onClick={() => setSelectedPost(post.id)}  // Automatically set selected post on click
                  onChange={(e) => setComment(e.target.value)}
                  className={styles.textarea}
                  placeholder="Add your Opinion..."
                />
                <button type="submit" className={styles.submitButton}>
                  <LiaCommentDotsSolid />
                </button>
              </form>
              {comments[post.id] && comments[post.id].length > 0 && (
                <div className={styles.commentsContainer}>
                  <h4>TOP OPINIONS:</h4>
                  {comments[post.id]
                    .slice(0, showMore[post.id] ? comments[post.id].length : 2) // Show only 2 by default, all when expanded
                    .map((comment) => (
                      <p key={comment.id} className={styles.opinionText}>
                        {comment.commentText} <small>- {comment.commentBy}</small>
                      </p>
                    ))}
                  {comments[post.id].length > 2 && (
                    <button onClick={() => toggleShowMore(post.id)} className={styles.showMoreButton}>
                      {showMore[post.id] ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;
