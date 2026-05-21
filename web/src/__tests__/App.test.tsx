import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

test('renders landing page heading', () => {
  const { container } = render(<div>AI Smart Banking</div>);
  expect(container).toHaveTextContent('AI Smart Banking');
});
