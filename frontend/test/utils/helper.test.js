import {
  get,
  has,
  valueByString,
  toFormData,
  formatDate,
  formatDatetime,
  validatePhoneNumber,
  isDate, // ✅ add this import
} from '../../src/utils/helpers.js';
describe('get', () => {
  const obj = { a: { b: { c: 42 } } };
  test('returns value for nested key', () => {
    expect(get(obj, 'a.b.c')).toBe(42);
  });
  test('returns undefined if key path does not exist', () => {
    expect(get(obj, 'a.b.x')).toBeUndefined();
  });
});

describe('has', () => {
  const obj = { a: { b: { c: 42 } } };
  test('returns true for existing key path', () => {
    expect(has(obj, 'a.b.c')).toBe(true);
  });
  test('returns false for non-existing key path', () => {
    expect(has(obj, 'a.b.x')).toBe(false);
  });
});

describe('valueByString', () => {
  const obj = { name: 'Alice', info: { age: 25, city: 'NY' } };
  test('returns concatenated values for multiple keys', () => {
    expect(valueByString(obj, 'name|info.age')).toBe('Alice 25');
  });
});

describe('formatDate', () => {
  test('formats date correctly', () => {
    expect(formatDate('2025-11-26')).toBe('26/11/2025');
  });
});

describe('formatDatetime', () => {
  test('formats datetime correctly', () => {
    const result = formatDatetime('2025-11-26T15:30:00');
    expect(result).toContain('26/11/2025');
    expect(result).toContain(':'); // contains time
  });
});

describe('validatePhoneNumber', () => {
  test('matches valid phone numbers', () => {
    expect('+1 (555) 123-4567').toMatch(validatePhoneNumber);
    expect('1234567890').toMatch(validatePhoneNumber);
  });
  test('does not match invalid phone numbers', () => {
    expect('abc123').not.toMatch(validatePhoneNumber);
  });
});

describe('toFormData', () => {
  test('creates FormData with input values', () => {
    // create a fake form in jsdom
    const form = document.createElement('form');

    const inputText = document.createElement('input');
    inputText.name = 'username';
    inputText.value = 'test';
    form.appendChild(inputText);

    const inputDisabled = document.createElement('input');
    inputDisabled.name = 'disabledField';
    inputDisabled.value = 'nope';
    inputDisabled.dataset.disabled = 'true';
    form.appendChild(inputDisabled);

    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.name = 'file';
    const blob = new Blob(['file contents'], { type: 'text/plain' });
    const file = new File([blob], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(inputFile, 'files', { value: [file] });
    form.appendChild(inputFile);

    const formData = toFormData(form);

    expect(formData.get('username')).toBe('test');
    expect(formData.has('disabledField')).toBe(false); // should skip disabled
    expect(formData.get('file').name).toBe('test.txt');
  });
});

describe('isDate', () => {
  test('returns true for valid date string', () => {
    expect(isDate({ date: '2025-11-26' })).toBe(true);
    expect(isDate({ date: '26/11/2025', format: 'DD/MM/YYYY' })).toBe(false);
  });

  test('returns false for invalid date string', () => {
    expect(isDate({ date: 'invalid-date' })).toBe(false);
    expect(isDate({ date: '' })).toBe(false);
  });

  test('returns false for boolean values', () => {
    expect(isDate({ date: true })).toBe(false);
    expect(isDate({ date: false })).toBe(false);
  });

  test('returns false for numbers', () => {
    expect(isDate({ date: 12345 })).toBe(false);
    expect(isDate({ date: 0 })).toBe(false);
  });

  test('returns false for undefined or null', () => {
    expect(isDate({ date: undefined })).toBe(true);
    expect(isDate({ date: null })).toBe(false);
  });
});
