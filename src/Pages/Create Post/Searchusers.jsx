import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/Firebase'; // Adjust to your Firebase config
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom'; // For navigation

const SearchUsers = () => {
  const [queryText, setQueryText] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!queryText) return setUsers([]); // If query is empty, reset users

      setLoading(true);
      try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('name', '>=', queryText), where('name', '<=', queryText + '\uf8ff'));
        const querySnapshot = await getDocs(q);
        
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(usersList);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [queryText]);

  return (
    <div style={{ backgroundColor: 'black', color: '#e0e0e0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <input 
        type="text" 
        placeholder="Search Users..." 
        value={queryText} 
        onChange={(e) => setQueryText(e.target.value)} 
        style={{
          backgroundColor: '#333',
          color: '#fff',
          border: '1px solid #444',
          borderRadius: '5px',
          padding: '10px',
          marginBottom: '20px',
          width: '100%',
          maxWidth: '400px',
          fontSize: '16px',
        }} 
      />
      {loading ? (
        <p style={{ color: '#bbb' }}></p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: '0', width: '100%', maxWidth: '400px' }}>
          {users.map((user) => (
            <li key={user.id} style={{ backgroundColor: '#1e1e1e', marginBottom: '10px', padding: '10px', borderRadius: '8px' }}>
              <Link to={`/profile/${user.id}`} style={{ textDecoration: 'none', color: '#03a9f4', fontWeight: 'bold', fontSize: '18px' }}>
                {user.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchUsers;
