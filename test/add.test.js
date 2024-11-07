const sum = require('./helpers/add');
describe('sum', () => {
  it('should return the sum of two numbers', () => {
    expect(sum(2, 7)).toBe(9);
  });
  it('should return a negative number when adding two negative numbers', () => {
    expect(sum(-6, -2)).toBe(-8);
  });
it('should fail to check test', () => {
    expect(sum(2, 3)).toBe(6);
  });
});