const { authorizedApiRequest } = require('../src/utils');

describe('utils ', () => {
  describe('authorizedApiRequest', () => {
    it('returns a rejected promise when token is undefined', () => {
      const token = undefined;
      const testFunction = function() {
        return 10;
      };

      return expect(authorizedApiRequest(token, testFunction)).rejects.toEqual(
        'Cannot call this method without setting the authorization token ' +
          '(in the constructor or using the authorize method).'
      );
    });

    it('returns the function result when token is not undefined', () => {
      const token = 'my_token';
      const testFunction = function() {
        return 10;
      };

      return expect(authorizedApiRequest(token, testFunction)).toBe(10);
    });
  });
});
