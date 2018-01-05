/**
 * Prepare headers for authorized requests.
 *
 * @param {string} token An authorization token.
 * @return {Object} A request headers object.
 */
function buildAuthorizedRequestHeaders(token) {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
}

/**
 * Convert a `Date` object to a Unix timestamp.
 *
 * @param {Date} date A date to be converted.
 * @return {integer} The date as a Unix timestamp.
 */
function dateToTimestamp(date) {
    return Math.round(date.getTime() / 1000);
}

/**
 * Return a rejected promise in case a token is undefined. Otherwise run a
 * function and return its result.
 *
 * @param {string|undefined} token A token to be checked.
 * @param {Function} f A function to be run.
 * @return {*} A rejected promise or result of the function.
 */
function authorizedApiRequest(token, f) {
    if (token === undefined) {
        return Promise.reject(
            'Cannot call this method without setting the authorization token ' +
                '(in the constructor or using the authorize method).'
        );
    }
    return f();
}

module.exports = {
    buildAuthorizedRequestHeaders,
    dateToTimestamp,
    authorizedApiRequest
};
