import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../../firebase/Firebase'; // Firebase config should be properly set up
import { db } from '../../firebase/Firebase'; // Import Firestore instance
const FetchIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const db = getFirestore(app);

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      try {
        const ideasCollection = collection(db, 'ideas');
        const querySnapshot = await getDocs(ideasCollection);
        const ideasData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setIdeas(ideasData);
        setError(null);
      } catch (err) {
        console.error('Error fetching ideas:', err);
        setError('Failed to load ideas. Please check permissions and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [db]);

  // Inline styles
  const containerStyle = {
    backgroundColor: '#000', // Black background
    color: '#fff',           // White text
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    margin: '0',
    minHeight: '100vh',      // Full viewport height
  };

  const titleStyle = {
    color: '#fff',           // White color for title
    textAlign: 'center',
    marginBottom: '10px',
    fontSize: '2rem',
    letterSpacing: '2px',
  };

  const descriptionStyle = {
    color: '#fff',           // White color for description
    textAlign: 'center',
    fontSize: '1.2rem',
    marginBottom: '20px',    // Margin below description
  };

  const listStyle = {
    listStyleType: 'none',
    padding: '0',
    margin: '20px 0',
    fontSize:'2em',
  };

  const listItemStyle = {
    backgroundColor: '#222',  // Darker black for contrast
    padding: '10px 15px',
    marginBottom: '10px',
    borderRadius: '5px',
  };

  if (loading) return <div style={containerStyle}>Loading ideas...</div>;
  if (error) return <div style={containerStyle}>{error}</div>;

  return (
    <div style={containerStyle}>
      
      <p style={descriptionStyle}>
        Share and explore innovative ideas with the community.
      </p>
      <h2 style={titleStyle}>Ideas</h2>
      {ideas.length > 0 ? (
        <ul style={listStyle}>
          {ideas.map(idea => (
            <li key={idea.id} style={listItemStyle}>
              <strong>{idea.title}</strong>: {idea.description}
              <br />
              <small style={{ color: '#bbb' }}>
                Posted by : {idea.uid} 
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p style={descriptionStyle}>No ideas found.</p>
      )}
    </div>
  );
};

export default FetchIdeas;
