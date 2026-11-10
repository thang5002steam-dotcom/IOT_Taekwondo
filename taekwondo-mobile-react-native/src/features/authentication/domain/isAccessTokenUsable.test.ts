import { isAccessTokenUsable } from './isAccessTokenUsable';

it('uses JWT expiry only as a local bootstrap hint', () => {
  expect(isAccessTokenUsable('x.eyJleHAiOjk5OTk5OTk5OTl9.y')).toBe(true);
  expect(isAccessTokenUsable('x.eyJleHAiOjF9.y')).toBe(false);
  expect(isAccessTokenUsable('invalid')).toBe(false);
});
