import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner'; // Import BarCodeScanner from Expo
import FourScreen from '../app/(tabs)/four'; // Adjust the import to the correct path

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock the requestPermissionsAsync function of BarCodeScanner
jest.mock('expo-barcode-scanner', () => ({
  BarCodeScanner: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  },
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    json: () => Promise.resolve([
      {
        id: 1,
        fullName: 'Gas Station 1',
        fullAddress: 'Address 1',
        priceDetails: [
          { currentPrice: 1.5, oilDerivateType: 2 },
          { currentPrice: 1.8, oilDerivateType: 4 },
        ],
        phoneNumber: '123-456-7890',
      },
      {
        id: 2,
        fullName: 'Gas Station 2',
        fullAddress: 'Address 2',
        priceDetails: [
          { currentPrice: 1.4, oilDerivateType: 2 },
          { currentPrice: 1.9, oilDerivateType: 4 },
        ],
        phoneNumber: '098-765-4321',
      },
    ]),
  })
) as jest.Mock;

describe('FourScreen component', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({ id: '1', name: 'City 1' }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calculates the cheapest gas station correctly when tank size is entered and calculate button is clicked', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <NavigationContainer>
        <FourScreen />
      </NavigationContainer>
    );

    await act(async () => {
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });

    const tankSizeInput = getByPlaceholderText('Enter tank size in liters');
    fireEvent.changeText(tankSizeInput, '10');

    const calculateButton = getByText('Calculate Cheapest Gas Station');
    fireEvent.press(calculateButton);

    await waitFor(() => {
      expect(queryByText('Cheapest Gas Station')).toBeTruthy();
    });

    expect(queryByText('Name: Gas Station 2')).toBeTruthy();
    expect(queryByText('Total Price: 14.00 BAM')).toBeTruthy();
  });
});
