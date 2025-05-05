import React from 'react';
import '../styles/GreetText.css';

const GreetText = ({ text = "B006ooooo " }) => {
  return (
    <div className="greet-text-container">
      <h1 className="greet-text">{text}</h1>
    </div>
  );
};

export default GreetText; 