import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TodaysTasks from '../screens/components/TodaysTasks';
import { Task } from '../services/plantService';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn() }),
  };
});

jest.mock('../services/authContext', () => ({ useAuth: () => ({ user: null, isGuest: true }) }));

jest.mock('../services/plantService', () => ({
  completeTask: jest.fn().mockResolvedValue(undefined),
}));

describe('TodaysTasks', () => {
  it('pressing View All does not crash', () => {
    const tasks: Task[] = [{ id: '1', taskName: 'Water', completed: false, createdAt: new Date().toISOString() }];
    const { getByText } = render(
      <TodaysTasks tasks={tasks} loading={false} error={null} />
    );

    fireEvent.press(getByText('View All'));
  });
});