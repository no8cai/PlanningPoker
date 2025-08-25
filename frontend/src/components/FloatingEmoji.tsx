import React, { useState } from 'react';
import './FloatingEmoji.css';

interface FloatingEmojiProps {
  emoji: string;
  userName: string;
  id: string;
}

const FloatingEmoji: React.FC<FloatingEmojiProps> = ({ emoji, userName, id }) => {
  const [position] = useState({
    x: Math.random() * 80 + 10, // Random position between 10% and 90%
    startY: 100,
    endY: -20
  });

  const style: React.CSSProperties & { [key: string]: any } = {
    left: `${position.x}%`,
    '--start-y': `${position.startY}%`,
    '--end-y': `${position.endY}%`,
  };

  return (
    <div
      id={`emoji-${id}`}
      className="floating-emoji"
      style={style}
    >
      <span className="emoji-symbol">{emoji}</span>
      <span className="emoji-username">{userName}</span>
    </div>
  );
};

export default FloatingEmoji;