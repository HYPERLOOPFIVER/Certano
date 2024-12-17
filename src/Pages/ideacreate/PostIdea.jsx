import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from '../../firebase/Firebase'; // Import your Firebase app configuration

const PostIdea = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const db = getFirestore(app); // Initialize Firestore

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim() === '' || description.trim() === '') return; // Prevent empty submissions

    try {
      await addDoc(collection(db, 'ideas'), {
        title: title,
        description: description,
        timestamp: new Date(),
      });
      setTitle('');
      setDescription('');
      alert('Idea created successfully!');
    } catch (error) {
      console.error('Error creating idea: ', error);
    }
  };

  return (
    <>
      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: 'white',  // Light theme background
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
      }}>
        <h2 style={{
          marginBottom: '20px',
          color: '#333', // Dark text for readability
        }}>Create a New Idea</h2>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
        }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            style={{
              padding: '12px 15px',
              marginBottom: '15px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s',
              backgroundColor: '#f9f9f9', // Light background for input fields
            }}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows="4"
            required
            style={{
              padding: '12px 15px',
              marginBottom: '20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s',
              backgroundColor: '#f9f9f9', // Light background for textarea
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#007bff',  // Light blue button
              color: '#fff',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}  // Hover effect
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'} // Reset on mouse out
          >
            Create Idea
          </button>
        </form>
      </div>
    </>
  );
};

export default PostIdea;
