import { test, expect } from 'bun:test';
import { validateDate } from './validation';

test('validateDate should return true for valid date', () => {
  expect(validateDate('2025-05-01')).toBe(true);
});

test('validateDate should return false for invalid date format', () => {
  expect(validateDate('01-05-2025')).toBe(false); // неверный формат
});

test('validateDate should return false for impossible date', () => {
  expect(validateDate('2025-02-30')).toBe(false); // такой даты не существует
});

