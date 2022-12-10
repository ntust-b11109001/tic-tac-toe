import React from 'react';
import { render } from '@testing-library/react';
import { App } from './app';

it('renders welcome message', () => {
    render(<App />);
});