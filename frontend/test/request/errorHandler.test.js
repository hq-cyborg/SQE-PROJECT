import { vi, describe, it, expect, beforeEach } from 'vitest';
import { notification } from 'antd';
import errorHandler from '@/request/errorHandler'; // adjust path
import codeMessage from '@/request/codeMessage'; // adjust path

// Mock notification from antd
vi.mock('antd', () => ({
  notification: {
    error: vi.fn(),
    config: vi.fn(),
  },
}));

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock localStorage methods
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });

    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };

    // Reset navigator
    vi.stubGlobal('navigator', { onLine: true });
  });

  it('returns correct object when offline', () => {
    vi.stubGlobal('navigator', { onLine: false });

    const result = errorHandler({});
    expect(result.success).toBe(false);
    expect(result.message).toContain('Check your internet network');
    expect(notification.error).toHaveBeenCalled();
  });

  it('returns correct object when no response', () => {
    vi.stubGlobal('navigator', { onLine: true });

    const result = errorHandler({});
    expect(result.success).toBe(false);
    expect(result.message).toContain('Contact your Account administrator');
  });

  it('logs out if JWT expired', () => {
    // Return valid JSON for both auth and isLogout
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'auth') return JSON.stringify({ token: 'dummy' });
      if (key === 'isLogout') return JSON.stringify({ isLogout: true });
      return null;
    });

    const error = {
      response: {
        data: { jwtExpired: true },
      },
    };

    errorHandler(error);

    expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth');
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('isLogout');
    expect(window.location.href).toBe('/logout');
  });

  it('shows notification on known status', () => {
    const error = {
      response: {
        status: 404,
        data: { message: 'Not found' },
      },
    };

    const result = errorHandler(error);

    expect(notification.error).toHaveBeenCalled();
    expect(result).toEqual(error.response.data);
  });

  it('logs out if JsonWebTokenError', () => {
    window.localStorage.getItem.mockReturnValue(JSON.stringify({ token: 'dummy' }));

    const error = {
      response: {
        status: 401,
        data: { error: { name: 'JsonWebTokenError' } },
      },
    };

    errorHandler(error);

    expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth');
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('isLogout');
    expect(window.location.href).toBe('/logout');
  });
});
