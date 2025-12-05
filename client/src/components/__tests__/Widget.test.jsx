import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// A simple component to test
const SimpleWidget = ({ title }) => (
    <div className="widget">
        <h2>{title}</h2>
    </div>
);

describe('SimpleWidget', () => {
    it('renders the title correctly', () => {
        render(<SimpleWidget title="Test Widget" />);
        expect(screen.getByText('Test Widget')).toBeInTheDocument();
    });
});
