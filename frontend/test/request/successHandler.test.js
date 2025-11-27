import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import request from '@/request/request';
import storePersist from '@/redux/storePersist';
import successHandler from '@/request/successHandler';
import errorHandler from '@/request/errorHandler';

// Mock axios
vi.mock('axios');

// Mock storePersist
vi.mock('@/redux/storePersist', () => ({
  default: { get: vi.fn(), set: vi.fn(), remove: vi.fn(), getAll: vi.fn(), clear: vi.fn() },
}));

// Mock handlers
vi.mock('@/request/successHandler', () => ({ default: vi.fn() }));
vi.mock('@/request/errorHandler', () => ({ default: vi.fn() }));

describe('request utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storePersist.get.mockReturnValue({ current: { token: 'dummy-token' } });
  });

  it('calls axios.post and successHandler on create', async () => {
    const mockResponse = { data: { id: 1, success: true, message: 'Created' } };
    axios.post.mockResolvedValue(mockResponse);

    const data = await request.create({ entity: 'user', jsonData: { name: 'John' } });

    expect(axios.post).toHaveBeenCalledWith('user/create', { name: 'John' });
    expect(successHandler).toHaveBeenCalledWith(mockResponse, {
      notifyOnSuccess: true,
      notifyOnFailed: true,
    });
    expect(data).toEqual({ id: 1, success: true, message: 'Created' });
  });

  it('calls errorHandler if axios.post fails', async () => {
    const error = new Error('Failed');
    axios.post.mockRejectedValue(error);

    await request.create({ entity: 'user', jsonData: { name: 'John' } }).catch(() => {});

    expect(errorHandler).toHaveBeenCalledWith(error);
  });
});
