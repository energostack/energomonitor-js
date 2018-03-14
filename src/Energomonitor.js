const axios = require('axios');
const qs = require('qs');

const {
  buildAuthorizedRequestHeaders,
  dateToTimestamp,
  authorizedApiRequest
} = require('./utils.js');

// If you wish to get feeds endpoint URL for a user with ID `abc`, call
// `ENDPOINT_URLS.feeds('abc')`.
const ENDPOINT_URLS = {
  auth: () => '/authorizations',
  user: userId => `/users/${userId}`,
  feeds: userId => `/users/${userId}/feeds`,
  feed: feedId => `/feeds/${feedId}`,
  streams: feedId => `/feeds/${feedId}/streams`,
  stream: (feedId, streamId) => `/feeds/${feedId}/streams/${streamId}`,
  streamData: (feedId, streamId) => `/feeds/${feedId}/streams/${streamId}/data`,
  relatedStreams: feedId => `/feeds/${feedId}/related_streams`,
  notifications: userId => `/users/${userId}/notifications`,
  notification: (userId, notificationId) => `/users/${userId}/notifications/${notificationId}`,
  notificationCount: userId => `/users/${userId}/notification_count`
};

/**
 * Represents an interaction session with the Energomonitor API.
 */
class Energomonitor {
  /**
   * Create a new instance of `Energomonitor`.
   *
   * @param {string} [token] Access token to authenticate the requests with.
   * Use this parameter in case you already generated a token in the past and
   * now you wish to use it, otherwise generate the token using
   * {@link Energomonitor#authorize}.
   * @param {Axios} [axiosInstance] Custom axios instance to be used for
   * handling HTTP requests. When not passed, the client will create its own
   * instance.
   * @param {string} [apiURL = https://api.energomonitor.com/v1]
   * Energomonitor API URL.
   */
  constructor(token, axiosInstance, apiURL = 'https://api.energomonitor.com/v1') {
    this._token = token;
    this._authorizedRequestHeaders = buildAuthorizedRequestHeaders(token);

    if (axiosInstance !== undefined) {
      this._axios = axiosInstance;
    } else {
      this._axios = axios.create();
    }
    this._axios.defaults['baseURL'] = apiURL;
  }

  /**
   * Create a new authorization for a user. Return an authorization object
   * containing an access token. The token will be saved internally in the
   * instance and it will subsequently be used by all other methods.
   *
   * @param {string} username Username used for HTTP Basic authentication.
   * @param {string} password Password used for HTTP Basic authentication.
   * @param {string} [note] User note for the created authorization.
   * @param {Object[]} [resources] List of
   * [resources]{@link https://developers.energomonitor.com/api/endpoints/authorization.html#resource-object}
   * associated with the created authorization. Default: all resources the
   * user is authorized to access.
   * @param {integer} [validMinutes] How long from now should the created
   * authorization be valid, in minutes.
   * @return {Promise} A promise that resolves to the
   * [authorization object]{@link https://developers.energomonitor.com/api/endpoints/authorization.html#authorization-object}.
   */
  authorize(username, password, note, resources, validMinutes) {
    const url = ENDPOINT_URLS.auth();

    const data = {};

    if (note !== undefined) {
      data['note'] = note;
    }
    if (resources !== undefined) {
      data['resources'] = resources;
    }
    if (validMinutes !== undefined) {
      data['valid_minutes'] = validMinutes;
    }

    const config = {
      auth: {
        username: username,
        password: password
      }
    };

    return this._axios.post(url, data, config).then(response => {
      const token = response.data.token;
      this._token = token;
      this._authorizedRequestHeaders = buildAuthorizedRequestHeaders(token);

      return response.data;
    });
  }

  /**
   * Retrieve a single user.
   *
   * @param {string} userId Retrieve a user with this ID.
   * @return {Promise} A promise that resolves to the
   * [user object]{@link https://developers.energomonitor.com/api/endpoints/users.html#user-object}.
   */
  getUser(userId) {
    const url = ENDPOINT_URLS.user(userId);
    const config = {
      headers: this._authorizedRequestHeaders
    };

    return authorizedApiRequest(this._token, () =>
      this._axios.get(url, config).then(response => response.data)
    );
  }

  /**
   * Retrieve a list of all user’s feeds.
   *
   * @param {string} userId Retrieve feeds of a user with this ID.
   * @return {Promise} A promise that resolves to the array of
   * [feed objects]{@link https://developers.energomonitor.com/api/endpoints/feeds-streams.html#feed-object}.
   */
  getFeeds(userId) {
    const url = ENDPOINT_URLS.feeds(userId);
    const config = {
      headers: this._authorizedRequestHeaders
    };

    return authorizedApiRequest(this._token, () =>
      this._axios.get(url, config).then(response => response.data)
    );
  }

  /**
   * Retrieve a single feed.
   *
   * @param {string} feedId Retrieve a feed with this ID.
   * @return {Promise} A promise that resolves to the
   * [feed object]{@link https://developers.energomonitor.com/api/endpoints/feeds-streams.html#feed-object}.
   */
  getFeed(feedId) {
    const url = ENDPOINT_URLS.feed(feedId);
    const config = {
      headers: this._authorizedRequestHeaders
    };

    return authorizedApiRequest(this._token, () =>
      this._axios.get(url, config).then(response => response.data)
    );
  }

  /**
   * Retrieve a list of streams belonging to a feed.
   *
   * @param {string} feedId Retrieve streams belonging to a feed with this ID.
   * @param {(string|string[])} [types] Only list streams of this type/types.
   * See the description of
   * [stream objects]{@link https://developers.energomonitor.com/api/endpoints/feeds-streams.html#stream-object}
   * for more details about stream types.
   * @param {(integer|integer[])} [channels] Only list streams with this
   * channel/channels. See the description of
   * [stream objects]{@link https://developers.energomonitor.com/api/endpoints/feeds-streams.html#stream-object}
   * for more details about channels.
   * @param {Date} [dataTimeFrom] Only list streams with data points measured
   * after or at this time.
   * @param {Date} [dataTimeTo] Only list streams with data points measured
   * before or at this time.
   * @return {Promise} A promise that resolves to the array of
   * [stream objects]{@link https://developers.energomonitor.com/api/endpoints/feeds-streams.html#stream-object}.
   */
  getStreams(feedId, types, channels, dataTimeFrom, dataTimeTo) {
    const url = ENDPOINT_URLS.streams(feedId);

    const params = {};

    if (types !== undefined) {
      params['type'] = types;
    }
    if (channels !== undefined) {
      params['channel'] = channels;
    }
    if (dataTimeFrom !== undefined) {
      params['data_time_from'] = dateToTimestamp(dataTimeFrom);
    }
    if (dataTimeTo !== undefined) {
      params['data_time_to'] = dateToTimestamp(dataTimeTo);
    }

    const config = {
      headers: this._authorizedRequestHeaders,
      params: params,
      // Custom querystring serializer is needed here because our API uses
      // parameters that can be specified multiple times (specifically
      // `time` and `channel`).
      //
      // For example, when `params = { channel: [1, 2] }`, we need to
      // build `channel=1&channel=2` from it.
      paramsSerializer: function(params) {
        return qs.stringify(params, { indices: false });
      }
    };

    return authorizedApiRequest(this._token, () =>
      this._axios.get(url, config).then(response => response.data)
    );
  }

  /**
   * Retrieve a single stream.
   *
   * @param {string} feedId Retrieve a stream belonging to a feed with this
   * ID.
   * @param {string} streamId Retrieve a stream with this ID.
   * @return {Promise} A promise that resolves to the
   * [stream object]{@link https://developers.energomonitor.com/api/endpoints/feeds-streams.html#stream-object)}.
   */
  getStream(feedId, streamId) {
    const url = ENDPOINT_URLS.stream(feedId, streamId);
    const config = {
      headers: this._authorizedRequestHeaders
    };

    return authorizedApiRequest(this._token, () =>
      this._axios.get(url, config).then(response => response.data)
    );
  }

  /**
   * Retrieve a list of a stream’s data points.
   *
   * @param {string} feedId Retrieve data points of a stream belonging to a
   * feed with this ID.
   * @param {string} streamId Retrieve data of a stream with this ID.
   * @param {Date} [timeFrom] Only list data points measured after or at this
   * time.
   * @param {Date} [timeTo] Only list data points measured before or at this
   * time.
   * @param {integer} [limit] Maximum number of returned data points. When
   * there are more matching data points than limit, the newest ones are
   * returned.
   * @return {Promise} A promise that resolves to the array with the data
   * points where each data point is an array with 2 elements: the time of
   * measurement (`integer`, a Unix timestamp) and a value (`integer |
   * float`). See the
   * [`GET /feeds/{feed_id}/streams/{stream_id}/data`]{@link https://developers.energomonitor.com/api/endpoints/feeds-streams.html#get-feeds-feed-id-streams-stream-id-data}
   * endpoint description for more details.
   */
  getStreamData(feedId, streamId, timeFrom, timeTo, limit) {
    const url = ENDPOINT_URLS.streamData(feedId, streamId);

    const params = {};

    if (limit !== undefined) {
      params['limit'] = limit;
    }
    if (timeFrom !== undefined) {
      params['time_from'] = dateToTimestamp(timeFrom);
    }
    if (timeTo !== undefined) {
      params['time_to'] = dateToTimestamp(timeTo);
    }

    const config = {
      headers: this._authorizedRequestHeaders,
      params: params
    };

    return authorizedApiRequest(this._token, () =>
      this._axios.get(url, config).then(response => response.data)
    );
  }

  /**
   * Retrieve a list of related streams.
   *
   * @param {string} feedId Retrieve related streams of a feed with this ID.
   * @return {Promise} A promise that resolves to the array with the groups,
   * where each group is an array with stream IDs identifying streams that
   * belong to the group. See the
   * [`GET /feeds/{feed_id}/related_stream`]{@link https://developers.energomonitor.com/api/endpoints/feeds-streams.html#get-feeds-feed-id-related-streams},
   * endpoint description for more details.
   */
  getRelatedStreams(feedId) {
    const url = ENDPOINT_URLS.relatedStreams(feedId);
    const config = {
      headers: this._authorizedRequestHeaders
    };

    return authorizedApiRequest(this._token, () =>
      this._axios.get(url, config).then(response => response.data)
    );
  }

  /**
   * Retrieve a list of user’s notifications.
   *
   * @param {string} userId Retrieve notifications of a user with this ID.
   * @param {Date} [createdAtFrom] Only list notifications created at or
   * after this time.
   * @return {Promise} A promise that resolves to the array of
   * [notification objects]{@link https://developers.energomonitor.com/api/endpoints/notifications.html#notification-object}.
   */
  getNotifications(userId, createdAtFrom) {
    const url = ENDPOINT_URLS.notifications(userId);

    const params = {};

    if (createdAtFrom !== undefined) {
      params['created_at_from'] = createdAtFrom.toISOString();
    }

    const config = {
      headers: this._authorizedRequestHeaders,
      params: params
    };

    return authorizedApiRequest(this._token, () =>
      this._axios.get(url, config).then(response => response.data)
    );
  }

  /**
   * Retrieve a single notification.
   *
   * @param {string} userId Retrieve a notification of a user with this ID.
   * @param {string} notificationId Retrieve a notification with this ID.
   * @return {Promise} A promise that resolves to the
   * [notification object]{@link https://developers.energomonitor.com/api/endpoints/notifications.html#notification-object}.
   */
  getNotification(userId, notificationId) {
    const url = ENDPOINT_URLS.notification(userId, notificationId);
    const config = {
      headers: this._authorizedRequestHeaders
    };

    return authorizedApiRequest(this._token, () =>
      this._axios.get(url, config).then(response => response.data)
    );
  }

  /**
   * Modify user’s notifications.
   *
   * @param {string} userId Modify notifications of a user with this ID.
   * @param {Object} [data] An object with one of the following properties
   * (their semantics is the same as in a
   * [notification object]{@link https://developers.energomonitor.com/api/endpoints/notifications.html#notification-object}):
   * `read` (`boolean`). For example, `{ read: true }` or `{ read: false }`.
   * @return {Promise} A promise that resolves to null.
   */
  updateNotifications(userId, data) {
    const url = ENDPOINT_URLS.notifications(userId);
    const config = {
      headers: this._authorizedRequestHeaders
    };

    return authorizedApiRequest(this._token, () =>
      this._axios.patch(url, data, config).then(() => null)
    );
  }

  /**
   * Modify a single notification.
   *
   * @param {string} userId Modify a notification of a user with this ID.
   * @param {string} notificationId Modify a notification with this ID.
   * @param {Object} [data] An object with one of the following properties
   * (their semantics is the same as in a
   * [notification object]{@link https://developers.energomonitor.com/api/endpoints/notifications.html#notification-object}):
   * `read` (`boolean`), `archived` (`boolean`). For example, `{ read: true,
   * archived: false }` or `{ read: false }`.
   * @return {Promise} A promise that resolves to the modified
   * [notification object]{@link https://developers.energomonitor.com/api/endpoints/notifications.html#notification-object}.
   */
  updateNotification(userId, notificationId, data) {
    const url = ENDPOINT_URLS.notification(userId, notificationId);

    const config = {
      headers: this._authorizedRequestHeaders
    };

    return authorizedApiRequest(this._token, () =>
      this._axios.patch(url, data, config).then(response => response.data)
    );
  }

  /**
   * Retrieve notification count information.
   *
   * @param {string} userId Retrieve notification count information of a user
   * with this ID.
   * @return {Promise} A promise that resolves to an object with `read`,
   * `unread` and `total` properties. See the
   * [`GET /users/{user_id}/notification_count`]{@link https://developers.energomonitor.com/api/endpoints/notifications.html#get-users-user-id-notification-count}
   * endpoint description for more details.
   */
  getNotificationCount(userId) {
    const url = ENDPOINT_URLS.notificationCount(userId);
    const config = {
      headers: this._authorizedRequestHeaders
    };

    return authorizedApiRequest(this._token, () =>
      this._axios.get(url, config).then(response => response.data)
    );
  }

  /**
   * Return the axios instance used by this client.
   *
   * @return {Object} The axios instance used by this client.
   */
  getAxiosInstance() {
    return this._axios;
  }
}

module.exports = Energomonitor;
