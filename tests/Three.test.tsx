import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import axios from 'axios';
import Three from '../app/(tabs)/three'; // Adjust the import to the correct path

jest.mock('axios');

describe('Three component', () => {
  const mockResponse = {
    data: [
      {
        priceDetails: [
          {
            oilDerivateType: 2,
            history: [
              { date: '2024-04-19T00:00:00Z', price: 2.71 },
              { date: '2024-04-29T00:00:00Z', price: 2.69 },
            ],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue(mockResponse);
  });

  it('fetches data when component mounts', async () => {
    render(<Three />);

    await act(async () => {
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('fetches data again when fuel type is selected', async () => {
    const { getByText } = render(<Three />);

    const fuelButton = getByText('BMB 95');
    fireEvent.press(fuelButton);

    await act(async () => {
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  it('displays error message on API failure', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('API error'));

    const { getByText } = render(<Three />);

    await act(async () => {
      await waitFor(() => {
        expect(getByText('Failed to fetch data')).toBeTruthy();
      });
    });
  });
});
