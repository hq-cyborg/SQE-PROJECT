import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

// Mock react-router-dom hooks
vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
  useRoutes: vi.fn(),
  Navigate: (props) => <div>{props.to}</div>,
}));

// Mock your app context
vi.mock('@/context/appContext', () => ({
  useAppContext: vi.fn(),
}));

// MOCK the routes module directly
vi.mock('@/router/routes', () => ({
  default: {
    app1: [{ path: '/app1', element: <div>App1</div> }],
    app2: [{ path: '/app2', element: <div>App2</div> }],
  },
}));

import AppRouter from '@/router/AppRouter';
import { useLocation, useRoutes } from 'react-router-dom';
import { useAppContext } from '@/context/appContext';

describe('AppRouter', () => {
  let mockApp;

  beforeEach(() => {
    mockApp = { default: vi.fn(), open: vi.fn() };
    useAppContext.mockReturnValue({ state: {}, appContextAction: { app: mockApp } });
    useRoutes.mockReset();
  });

  test('calls app.default if path is /', () => {
    useLocation.mockReturnValue({ pathname: '/' });
    useRoutes.mockReturnValue(<div>Home Route</div>);
    render(<AppRouter />);
    expect(mockApp.default).toHaveBeenCalled();
    expect(mockApp.open).not.toHaveBeenCalled();
  });

  test('calls app.open with correct app key', () => {
    useLocation.mockReturnValue({ pathname: '/app1' });
    useRoutes.mockReturnValue(<div>App1 Route</div>);
    render(<AppRouter />);
    expect(mockApp.open).toHaveBeenCalledWith('app1');
  });

  test('calls app.open with default for unknown path', () => {
    useLocation.mockReturnValue({ pathname: '/unknown' });
    useRoutes.mockReturnValue(<div>Unknown Route</div>);
    render(<AppRouter />);
    expect(mockApp.open).toHaveBeenCalledWith('default');
  });
});
