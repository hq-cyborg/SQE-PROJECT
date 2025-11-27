import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

// Self-contained BASE_URL and checkImage function
const BASE_URL = 'http://localhost:8888';

async function checkImage(path) {
  try {
    const response = await axios.get(path, {
      headers: {
        'Access-Control-Allow-Origin': BASE_URL,
      },
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

describe('checkImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true if axios GET responds with status 200', async () => {
    axios.get.mockResolvedValue({ status: 200 });

    const result = await checkImage('/some/path/image.jpg');
    expect(result).toBe(true);
    expect(axios.get).toHaveBeenCalledWith('/some/path/image.jpg', {
      headers: { 'Access-Control-Allow-Origin': BASE_URL },
    });
  });

  it('returns false if axios GET responds with non-200 status', async () => {
    axios.get.mockResolvedValue({ status: 404 });

    const result = await checkImage('/some/path/image.jpg');
    expect(result).toBe(false);
  });

  it('returns false if axios GET throws an error', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    const result = await checkImage('/some/path/image.jpg');
    expect(result).toBe(false);
  });
});
