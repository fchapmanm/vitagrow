import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StatsSection from '../screens/components/StatsSection';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn() }),
  };
});

jest.mock('../services/authContext', () => ({
  useAuth: () => ({ isGuest: false }),
}));

jest.mock('../hooks/useGuestLimits', () => ({
  useGuestLimits: () => ({ loading: false, maxGrowingPlants: 3, viewedCount: 0, maxViewedPlants: 50 }),
}));

describe('StatsSection', () => {
  it('renders and handles navigation presses', () => {
    const { getByText } = render(
      <StatsSection
        growingPlantsCount={1}
        favoritePlantsCount={2}
        completedTasksToday={0}
        todayTasksCount={3}
      />
    );

    expect(getByText('Growing')).toBeTruthy();
    expect(getByText('Favorites')).toBeTruthy();
    expect(getByText('Reminder')).toBeTruthy();

    fireEvent.press(getByText('Growing'));
    fireEvent.press(getByText('Favorites'));
    fireEvent.press(getByText('Reminder'));
  });
});