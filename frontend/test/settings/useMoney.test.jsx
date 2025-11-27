import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useMoney from '@/settings/useMoney';
import { vi } from 'vitest';

// Mock selectors
vi.mock('@/redux/settings/selectors', () => ({
  selectMoneyFormat: vi.fn(),
}));

// Mock storePersist default export
vi.mock('@/redux/storePersist', () => ({
  default: {
    get: vi.fn(),
  },
}));

import { selectMoneyFormat } from '@/redux/settings/selectors';
import storePersist from '@/redux/storePersist';

describe('useMoney hook', () => {
  const mockStore = (initialState = {}) =>
    configureStore({
      reducer: (state = initialState) => state,
    });

  const renderHook = (store) => {
    let result;
    const TestComponent = () => {
      result = useMoney();
      return null;
    };
    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );
    return result;
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('returns settings from selector if available', () => {
    selectMoneyFormat.mockReturnValue({
      currency_symbol: '$',
      currency_position: 'before',
      decimal_sep: '.',
      thousand_sep: ',',
      cent_precision: 2,
      zero_format: false,
      currency_code: 'USD',
    });

    const store = mockStore();
    const result = renderHook(store);

    expect(result.currency_symbol).toBe('$');
    expect(result.currency_code).toBe('USD');
    expect(result.currency_position).toBe('before');
  });

  test('falls back to storePersist if selector returns null', () => {
    selectMoneyFormat.mockReturnValue(null);
    storePersist.get.mockReturnValue({
      money_format_settings: {
        currency_symbol: '€',
        currency_position: 'after',
        decimal_sep: ',',
        thousand_sep: '.',
        cent_precision: 2,
        zero_format: false,
        currency_code: 'EUR',
      },
    });

    const store = mockStore();
    const result = renderHook(store);

    expect(result.currency_symbol).toBe('€');
    expect(result.currency_code).toBe('EUR');
    expect(result.currency_position).toBe('after');
  });

  test('amountFormatter and moneyFormatter format correctly', () => {
    selectMoneyFormat.mockReturnValue({
      currency_symbol: '$',
      currency_position: 'before',
      decimal_sep: '.',
      thousand_sep: ',',
      cent_precision: 2,
      zero_format: false,
      currency_code: 'USD',
    });

    const store = mockStore();
    const result = renderHook(store);

    expect(result.amountFormatter({ amount: 1234.56 })).toBe('1,234.56');
    expect(result.moneyFormatter({ amount: 1234.56 })).toBe('$ 1,234.56');
  });

  test('moneyRowFormatter returns correct JSX structure', () => {
    selectMoneyFormat.mockReturnValue({
      currency_symbol: '$',
      currency_position: 'before',
      decimal_sep: '.',
      thousand_sep: ',',
      cent_precision: 2,
      zero_format: false,
      currency_code: 'USD',
    });

    const store = mockStore();
    const { moneyRowFormatter } = renderHook(store);

    const row = moneyRowFormatter({ amount: 1000 });
    expect(row.props.style.textAlign).toBe('right');
    // Access fragment children for the rendered text
    const childText = row.children.props.children.join
      ? row.children.props.children.join('')
      : row.children.props.children;
    expect(childText).toBe('$ 1,000.00');
  });
});
