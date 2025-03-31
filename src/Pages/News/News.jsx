import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../News/News.module.css';

const NewsComponent = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `https://newsapi.org/v2/top-headlines?country=us&apiKey=12db8191a8454471b273b630d2bd4822`
        );
        setArticles(response.data.articles);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching the news data", error);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      
      
      <center><h1 className={styles.Certtimes}>Certano Times</h1></center>

      

      <ul className={styles.articleList}>
        {articles.map((article, index) => (
          <li key={index} className={styles.articleItem}>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <center>
                <img  
                  src={article.urlToImage}
                  alt={article.title}
                  className={styles.articleImage}
                />
              </center>
              <h2 className={styles.articleTitle}>{article.title}</h2>
              <p className={styles.articleDescription}>{article.description}</p>
              <p className={styles.articleContent}>
                {article.content ? article.content.substring(0, 150) + '...' : 'Read more about this story by clicking the link above.'}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsComponent;
