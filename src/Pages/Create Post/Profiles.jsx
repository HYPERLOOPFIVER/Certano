import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase/Firebase'; // Adjust to your Firebase config
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // For navigation to edit page

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Get current logged-in user
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user.uid);
      } else {
        setCurrentUser(null);
      }
    });

    const fetchUsersWithRelatedData = async () => {
      try {
        const usersCollectionRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollectionRef);
        
        const usersList = await Promise.all(
          usersSnapshot.docs.map(async (userDoc) => {
            const userData = userDoc.data();
            const userId = userDoc.id;
            
            // Query posts related to this user
            const postsQuery = query(
              collection(db, 'posts'),
              where('uid', '==', userId)
            );
            const postsSnapshot = await getDocs(postsQuery);
            const postsCount = postsSnapshot.size;
            
            // Query reels related to this user
            const reelsQuery = query(
              collection(db, 'reels'),
              where('uid', '==', userId)
            );
            const reelsSnapshot = await getDocs(reelsQuery);
            const reelsCount = reelsSnapshot.size;
            
            return {
              id: userId,
              name: userData.name || 'Unknown',
              email: userData.email || 'No email',
              bio: userData.bio || 'No bio',
              profilePic: userData.profilePic || null,
              followers: Array.isArray(userData.followers) 
                ? userData.followers 
                : [],
              following: Array.isArray(userData.following)
                ? userData.following
                : [],
              posts: postsCount,
              reels: reelsCount,
            };
          })
        );
        
        setUsers(usersList);
      } catch (err) {
        setError('Error fetching users: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsersWithRelatedData();
    
    // Cleanup auth listener
    return () => unsubscribe();
  }, []);

  const handleEditClick = (userId) => {
    // Option 1: Navigate to dedicated edit profile page
    navigate(`/edit-profile/${userId}`);
    
    // Option 2: Enable inline editing
    // const userToEdit = users.find(user => user.id === userId);
    // setEditMode(userId);
    // setEditData({
    //   name: userToEdit.name,
    //   bio: userToEdit.bio,
    //   email: userToEdit.email
    // });
  };

  const handleEditSave = async (userId) => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        name: editData.name,
        bio: editData.bio,
        email: editData.email
      });
      
      // Update local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, ...editData };
        }
        return user;
      }));
      
      setEditMode(null);
    } catch (err) {
      setError('Error updating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading users...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="users-container">
      <h2 className="section-title">All Users</h2>
      <div className="users-grid">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-header">
              {user.profilePic ? (
                <img src={user.profilePic} alt={user.name} className="profile-image" />
              ) : (
                <div className="profile-placeholder">{user.name.charAt(0)}</div>
              )}
              
              <div className="user-info">
                <h3>{user.name}</h3>
                <p className="user-email">{user.email}</p>
              </div>
              
              {currentUser === user.id && (
                <button 
                  className="edit-profile-btn"
                  onClick={() => handleEditClick(user.id)}
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            <div className="user-stats">
              <div className="stat">
                <span className="stat-value">{user.followers.length}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-value">{user.following?.length || 0}</span>
                <span className="stat-label">Following</span>
              </div>
              <div className="stat">
                <span className="stat-value">{user.posts}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{user.reels}</span>
                <span className="stat-label">Reels</span>
              </div>
            </div>
            
            {user.bio && <p className="user-bio">{user.bio}</p>}
            
            {/* Inline edit form - alternative to dedicated edit page */}
            {editMode === user.id && (
              <div className="edit-profile-form">
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  placeholder="Name"
                />
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  placeholder="Email"
                />
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  placeholder="Bio"
                />
                <div className="edit-actions">
                  <button onClick={() => handleEditSave(user.id)}>Save</button>
                  <button onClick={() => setEditMode(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllUsers;