import React from 'react';
import Chatbot from './Chatbot';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="header">
        <h1>AI Chatbot</h1>
        <p>Powered by AWS Lambda • Offline Ready</p>
      </header>
      <Chatbot />
    </div>
  );
}

export default App;