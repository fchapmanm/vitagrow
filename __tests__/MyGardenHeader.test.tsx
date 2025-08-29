import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MyGardenHeader from '../screens/components/MyGardenHeader';

describe('MyGardenHeader', () => {
  it('renders counts and add button correctly', () => {
    const onAddPress = jest.fn();
    const { getByText, getByTestId } = render(
      <MyGardenHeader
        growingCount={2}
        remindersCount={3}
        showAddButton={true}
        onAddPress={onAddPress}
      />
    );

    expect(getByText('My Garden')).toBeTruthy();
    expect(getByText('2 Growing')).toBeTruthy();
    expect(getByText('3 Due')).toBeTruthy();

    const button = getByTestId('add-button');
    fireEvent.press(button);
    expect(onAddPress).toHaveBeenCalled();
  });

  it('hides add button when showAddButton is false', () => {
    const { queryByTestId } = render(
      <MyGardenHeader
        growingCount={0}
        remindersCount={0}
        showAddButton={false}
        onAddPress={() => {}}
      />
    );
    expect(queryByTestId('add-button')).toBeNull();
  });
});

