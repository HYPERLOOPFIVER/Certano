import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/Firebase'; // Adjust to your Firebase config
import { collection, getDocs, query, where } from 'firebase/firestore';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
              followers: Array.isArray(userData.followers)
                ? userData.followers
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
  }, []);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>All Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong>
            <p>Email: {user.email}</p>
            <p>Followers: {user.followers.length}</p>
            <p>Posts: {user.posts}</p>
            <p>Reels: {user.reels}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllUsers;
