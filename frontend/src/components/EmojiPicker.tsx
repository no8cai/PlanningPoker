import React, { useState, useRef, useEffect } from 'react';
import './EmojiPicker.css';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EMOJI_LIST = [
  '👍', '👎', '👏', '🎉', '🚀', '💯', '🔥', '❤️',
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊',
  '😎', '🤔', '🤯', '😴', '🤗', '🙌', '💪', '🎯',
  '⭐', '✨', '💡', '🎈', '🎊', '🥳', '🤩', '😍'
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState<string[]>(['👍', '🎉', '😊', '🔥']);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEmojiClick = (emoji: string) => {
    try {
      onEmojiSelect(emoji);
      
      // Update recent emojis
      setRecentEmojis(prev => {
        const newRecent = [emoji, ...prev.filter(e => e !== emoji)].slice(0, 4);
        return newRecent;
      });
      
      // Animate the emoji button
      const button = document.querySelector('.emoji-trigger');
      if (button) {
        button.classList.add('emoji-sent');
        setTimeout(() => {
          if (button) {
            button.classList.remove('emoji-sent');
          }
        }, 600);
      }
    } catch (error) {
      console.error('Error handling emoji click:', error);
    }
  };

  return (
    <div className="emoji-picker-container" ref={containerRef}>
      <div className="quick-emojis">
        {recentEmojis.map((emoji, index) => (
          <button
            key={index}
            className="quick-emoji-btn"
            onClick={() => handleEmojiClick(emoji)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {emoji}
          </button>
        ))}
      </div>
      
      <button 
        className="emoji-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="emoji-icon">😊</span>
        <span className="emoji-text">React</span>
      </button>

      {isOpen && (
        <div className="emoji-picker-popup">
          <div className="emoji-grid">
            {EMOJI_LIST.map((emoji, index) => (
              <button
                key={index}
                className="emoji-option"
                onClick={() => {
                  handleEmojiClick(emoji);
                  setIsOpen(false);
                }}
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;