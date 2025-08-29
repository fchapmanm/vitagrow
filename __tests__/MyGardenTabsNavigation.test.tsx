import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MyGarden from '../screens/main/MyGarden';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), setParams: jest.fn() }),
    useFocusEffect: (cb: any) => cb(),
  };
});

jest.mock('../services/authContext', () => ({ useAuth: () => ({ user: null, isGuest: true }) }));

jest.mock('../services/plantService', () => ({
  fetchUserPlants: jest.fn().mockResolvedValue([]),
  fetchUserTasks: jest.fn().mockResolvedValue([]),
  fetchTodayReminders: jest.fn().mockResolvedValue([]),
}));

describe('MyGarden tabs', () => {
  it('changes tabs on press', async () => {
    const { getByText } = render(<MyGarden route={{ params: {} }} />);

    fireEvent.press(getByText('Growing'));
    fireEvent.press(getByText('Reminder'));
    fireEvent.press(getByText('Favorites'));
  });
});