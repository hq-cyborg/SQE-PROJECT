import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import request from '@/request/request';
import storePersist from '@/redux/storePersist';
import successHandler from '@/request/successHandler';
import errorHandler from '@/request/errorHandler';

vi.mock('axios');
vi.mock('@/redux/storePersist', () => ({
  default: { get: vi.fn(), set: vi.fn(), remove: vi.fn(), getAll: vi.fn(), clear: vi.fn() },
}));
vi.mock('@/request/successHandler', () => ({ default: vi.fn() }));
vi.mock('@/request/errorHandler', () => ({ default: vi.fn() }));

describe('request utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storePersist.get.mockReturnValue({ current: { token: 'dummy-token' } });
  });

  it('should call axios.post and successHandler on create', async () => {
    const mockResponse = { data: { id: 1 } };
    axios.post.mockResolvedValue(mockResponse);

    const data = await request.create({ entity: 'user', jsonData: { name: 'John' } });

    expect(axios.post).toHaveBeenCalledWith('user/create', { name: 'John' });
    expect(successHandler).toHaveBeenCalledWith(mockResponse, {
      notifyOnSuccess: true,
      notifyOnFailed: true,
    });
    expect(data).toEqual({ id: 1 });
  });

  it('should call errorHandler if axios.post fails', async () => {
    const error = new Error('Failed');
    axios.post.mockRejectedValue(error);

    await request.create({ entity: 'user', jsonData: { name: 'John' } }).catch(() => {});

    expect(errorHandler).toHaveBeenCalledWith(error);
  });

  it('should include auth token in axios headers', async () => {
    axios.post.mockResolvedValue({ data: {} });

    await request.create({ entity: 'user', jsonData: { name: 'John' } });

    expect(axios.defaults.headers.common.Authorization).toBe('Bearer dummy-token');
  });

  it('should handle multipart upload', async () => {
    const mockResponse = { data: { success: true } };
    axios.post.mockResolvedValue(mockResponse);

    const formData = new FormData();
    formData.append('file', new Blob(['content'], { type: 'text/plain' }));

    const data = await request.createAndUpload({ entity: 'file/upload', jsonData: formData });

    expect(axios.post).toHaveBeenCalledWith(
      'file/upload/create',
      formData,
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );

    expect(data).toEqual({ success: true });
  });
});
