import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/Firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Search, X, User } from 'lucide-react';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }
  }, []);

  // Save recent searches to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsSearching(true);
    
    if (!searchQuery.trim()) {
      setUsers([]);
      setIsSearching(false);
      return;
    }
    
    try {
      // Query all users in the 'users' collection
      const usersQuery = collection(db, 'users');
      const usersSnapshot = await getDocs(usersQuery);
      
      // Map the results into an array and filter by name
      const usersList = usersSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(user => 
          user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      // Set users list to state
      setUsers(usersList);
      
      // Add to recent searches if we have results and it's not already in recent searches
      if (usersList.length > 0 && !recentSearches.includes(searchQuery)) {
        // Keep only the 10 most recent searches
        const updatedSearches = [searchQuery, ...recentSearches.slice(0, 9)];
        setRecentSearches(updatedSearches);
      }
      
      if (usersList.length === 0) {
        setError('No users found.');
      }
    } catch (error) {
      setError('Error fetching users: ' + error.message);
    }
    
    setIsSearching(false);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setUsers([]);
  };
  
  const removeRecentSearch = (search) => {
    const updatedSearches = recentSearches.filter(item => item !== search);
    setRecentSearches(updatedSearches);
  };
  
  const handleRecentSearchClick = (search) => {
    setSearchQuery(search);
    setTimeout(() => {
      handleSearch();
    }, 0);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      padding: '16px',
    },
    innerContainer: {
      maxWidth: '500px',
      margin: '0 auto',
    },
    header: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px',
      textAlign: 'center',
    },
    form: {
      position: 'relative',
      marginBottom: '24px',
    },
    inputContainer: {
      position: 'relative',
    },
    input: {
      width: '100%',
      backgroundColor: '#262626',
      color: '#fff',
      padding: '8px 40px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '16px',
      outline: 'none',
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#8e8e8e',
    },
    clearButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#8e8e8e',
      cursor: 'pointer',
    },
    errorMessage: {
      color: '#ff3b30',
      textAlign: 'center',
      marginBottom: '16px',
    },
    recentSearchesContainer: {
      marginBottom: '24px',
    },
    recentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    },
    recentTitle: {
      color: '#8e8e8e',
      fontWeight: '500',
    },
    recentSearchItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    },
    searchItemLeft: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    },
    searchIconCircle: {
      backgroundColor: '#262626',
      borderRadius: '50%',
      padding: '8px',
      marginRight: '12px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeButton: {
      background: 'none',
      border: 'none',
      color: '#8e8e8e',
      cursor: 'pointer',
    },
    usersList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    userItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    userItemHover: {
      ':hover': {
        backgroundColor: '#262626',
      },
    },
    userIconContainer: {
      backgroundColor: '#363636',
      borderRadius: '50%',
      padding: '8px',
      marginRight: '12px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    userName: {
      fontWeight: '500',
    },
    userEmail: {
      fontSize: '14px',
      color: '#8e8e8e',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <h2 style={styles.header}>Search</h2>
        
        <form onSubmit={handleSearch} style={styles.form}>
          <div style={styles.inputContainer}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search"
              style={styles.input}
            />
            <div style={styles.searchIcon}>
              <Search size={20} />
            </div>
            {searchQuery && (
              <button 
                type="button" 
                onClick={clearSearch}
                style={styles.clearButton}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </form>

        {error && <p style={styles.errorMessage}>{error}</p>}

        {!isSearching && searchQuery === '' && recentSearches.length > 0 && (
          <div style={styles.recentSearchesContainer}>
            <div style={styles.recentHeader}>
              <h3 style={styles.recentTitle}>Recent</h3>
            </div>
            {recentSearches.map((search, index) => (
              <div key={index} style={styles.recentSearchItem}>
                <div 
                  style={styles.searchItemLeft} 
                  onClick={() => handleRecentSearchClick(search)}
                >
                  <div style={styles.searchIconCircle}>
                    <Search size={16} color="#8e8e8e" />
                  </div>
                  <span>{search}</span>
                </div>
                <button 
                  onClick={() => removeRecentSearch(search)}
                  style={styles.removeButton}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          {users.length > 0 && (
            <div style={styles.usersList}>
              {users.map((userData) => (
                <div 
                  key={userData.id} 
                  style={{
                    ...styles.userItem,
                    ':hover': { backgroundColor: '#262626' }
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#262626'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={styles.userIconContainer}>
                    <User size={24} color="#d9d9d9" />
                  </div>
                  <div>
                    <h3 style={styles.userName}>{userData.name}</h3>
                    <p style={styles.userEmail}>{userData.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;