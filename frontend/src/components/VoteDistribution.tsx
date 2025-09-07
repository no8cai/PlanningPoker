import React from 'react';
import './VoteDistribution.css';

interface VoteDistributionProps {
  distribution: { [key: string]: number };
  totalVotes: number;
  revealed: boolean;
}

const VoteDistribution: React.FC<VoteDistributionProps> = ({ distribution, totalVotes, revealed }) => {
  if (!revealed || totalVotes === 0) {
    return null;
  }

  // Define all possible Fibonacci values in order
  const fibonacciSequence = ['0', '0.5', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'];
  
  // Filter to only include values that are actually available as voting options
  const commonValues = ['0.5', '1', '2', '3', '5', '8', '13', '?'];
  
  // Only show values that have votes
  const displayValues = Object.keys(distribution).sort((a, b) => {
    const indexA = fibonacciSequence.indexOf(a);
    const indexB = fibonacciSequence.indexOf(b);
    
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // Handle non-fibonacci values
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    return a.localeCompare(b);
  });

  // Find the maximum count for scaling
  const maxCount = Math.max(...displayValues.map(v => distribution[v] || 0), 1);

  // Calculate consensus level
  const getConsensusLevel = () => {
    const uniqueVotes = Object.keys(distribution).length;
    if (uniqueVotes === 1) return { level: 'Consensus', color: '#4CAF50', emoji: '✅' };
    if (uniqueVotes === 2) return { level: 'Strong', color: '#8BC34A', emoji: '👍' };
    if (uniqueVotes === 3) return { level: 'Moderate', color: '#FFC107', emoji: '🤔' };
    return { level: 'Low', color: '#FF9800', emoji: '🔄' };
  };

  const consensus = getConsensusLevel();

  // Calculate statistics for numerical values
  const numericalValues = Object.entries(distribution)
    .filter(([key]) => !isNaN(parseFloat(key)))
    .map(([key, count]) => ({ value: parseFloat(key), count }));
  
  let average = 0;
  
  if (numericalValues.length > 0) {
    const sum = numericalValues.reduce((acc, item) => acc + (item.value * item.count), 0);
    const numCount = numericalValues.reduce((acc, item) => acc + item.count, 0);
    average = sum / numCount;
  }

  // Find mode (most frequent value)
  const mode = Object.entries(distribution).reduce((a, b) => 
    distribution[a[0]] > distribution[b[0]] ? a : b
  )[0];

  return (
    <div className="vote-distribution-compact">
      {/* Header with inline stats */}
      <div className="compact-header">
        <div className="header-left">
          <h3>Vote Distribution</h3>
          <div className="inline-stats">
            <span className="stat-mini">
              <span className="stat-value">{totalVotes}</span> votes
            </span>
            {average > 0 && (
              <span className="stat-mini">
                <span className="stat-value">{average.toFixed(1)}</span> avg
              </span>
            )}
            <span className="stat-mini">
              <span className="stat-value">{mode}</span> most voted
            </span>
          </div>
        </div>
        <div className="consensus-indicator" style={{ backgroundColor: consensus.color + '20', borderColor: consensus.color }}>
          <span className="consensus-emoji">{consensus.emoji}</span>
          <span className="consensus-text">{consensus.level}</span>
        </div>
      </div>

      {/* Horizontal bar chart */}
      <div className="horizontal-chart">
        {displayValues.map((value) => {
          const count = distribution[value];
          const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
          
          return (
            <div key={value} className="horizontal-bar-row">
              <div className="bar-label-left">{value}</div>
              <div className="bar-track">
                <div 
                  className="horizontal-bar" 
                  style={{ 
                    width: `${barWidth}%`,
                  }}
                  title={`${count} vote${count !== 1 ? 's' : ''} (${percentage.toFixed(1)}%)`}
                >
                  <span className="bar-count-inline">{count} {count === 1?'vote':'votes'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VoteDistribution;