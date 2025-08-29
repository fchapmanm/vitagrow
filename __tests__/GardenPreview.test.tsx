import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GardenPreview from '../screens/components/GardenPreview';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn() }),
  };
});

describe('GardenPreview', () => {
  it('renders empty state and buttons press without crash', () => {
    const { getByText } = render(<GardenPreview plants={[]} loading={false} />);
    fireEvent.press(getByText('View Favorites'));
    fireEvent.press(getByText('View All'));
  });
});