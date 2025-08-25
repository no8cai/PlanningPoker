import React, { useCallback } from 'react';
import './VotingCard.css';

interface VotingCardProps {
  value: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const VotingCard: React.FC<VotingCardProps> = ({ value, selected, onClick, disabled }) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent any scrolling or focus changes
    const element = e.currentTarget;
    element.blur();

    if (!disabled) {
      // Use timeout to ensure DOM is stable before state change
      setTimeout(() => {
        onClick();
      }, 0);
    }
  }, [disabled, onClick]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      const element = e.currentTarget;
      element.blur();

      setTimeout(() => {
        onClick();
      }, 0);
    }
  }, [disabled, onClick]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent focus from changing
    const element = e.currentTarget;
    element.blur();
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Immediately blur to prevent any viewport changes
    const element = e.currentTarget;
    element.blur();
  }, []);

  return (
    <div
      className={`voting-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyPress}
      onFocus={handleFocus}
      onBlur={(e) => e.preventDefault()}
      role="button"
      tabIndex={-1}
      aria-pressed={selected}
      aria-disabled={disabled}
      data-testid={`voting-card-${value}`}
    >
      <span
        className="card-value"
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
        onFocus={(e) => e.preventDefault()}
      >
        {value}
      </span>
    </div>
  );
};

export default VotingCard;