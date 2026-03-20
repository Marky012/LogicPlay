import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Gamification from '../Gamification';

describe('Gamification Component', () => {
  it('renders correctly with given props', () => {
    render(<Gamification points={150} level={2} badges={['First Circuit', 'Perfect Score']} />);
    
    // Check level
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Check points
    expect(screen.getByText('150 pts')).toBeInTheDocument();
    
    // Check points to next level calculation (2 * 100 = 200)
    expect(screen.getByText('200')).toBeInTheDocument();
    
    // Check badges
    expect(screen.getByTitle('First Circuit')).toBeInTheDocument();
    expect(screen.getByTitle('Perfect Score')).toBeInTheDocument();
  });

  it('renders graceful fallback when no badges are present', () => {
    render(<Gamification points={0} level={1} badges={[]} />);
    expect(screen.getByText('No badges yet')).toBeInTheDocument();
  });
});
