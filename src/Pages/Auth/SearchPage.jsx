import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/Firebase';
import { collection, getDocs } from 'firebase/firestore';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Query all users in the 'users' collection
      const usersQuery = collection(db, 'users');
      const usersSnapshot = await getDocs(usersQuery);
      
      // Map the results into an array
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Set users list to state
      setUsers(usersList);
      
      if (usersList.length === 0) {
        setError('No users found.');
      }
    } catch (error) {
      setError('Error fetching users: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Search Users</h2>
      <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name"
          style={{
            padding: '10px',
            border: '1px solid #007bff',
            borderRadius: '5px',
            fontSize: '16px',
            width: '300px',
          }}
        />
        <button type="submit" style={{
          padding: '10px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          marginLeft: '10px',
        }}>
          Search
        </button>
      </form>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <div>
        {users.length > 0 ? (
          users.map((userData) => (
            <div key={userData.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '10px' }}>
              <div>
                <h3>{userData.name}</h3>
                <p>{userData.email}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
