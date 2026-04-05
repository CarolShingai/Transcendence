import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from backend API
    const fetchData = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Transcendence</h1>
        <p>Welcome to the React Frontend</p>
      </header>

      <main className="App-main">
        <section className="status-section">
          <h2>Application Status</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="error">Error: {error}</p>}
          {data && (
            <div className="data-display">
              <p>Backend connected successfully!</p>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </section>

        <section className="info-section">
          <h2>About This Application</h2>
          <p>
            This is the new React-based frontend for the Transcendence project.
            It replaces the previous Angular implementation.
          </p>
          <ul>
            <li>React 19 - Modern UI library</li>
            <li>Responsive design</li>
            <li>API integration with backend</li>
            <li>Docker containerization</li>
          </ul>
        </section>
      </main>

      <footer className="App-footer">
        <p>&copy; 2026 Transcendence Project</p>
      </footer>
    </div>
  );
}

export default App;
