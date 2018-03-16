const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const Energomonitor = require('../src/Energomonitor.js');
const mockData = require('./mock-data/mockData.json');

describe('Energomonitor', () => {
  let energomonitorAuthorized;
  let axiosMockAuthorized;
  let energomonitorUnauthorized;

  beforeAll(() => {
    energomonitorUnauthorized = new Energomonitor();

    energomonitorAuthorized = new Energomonitor('my-token');
    axiosMockAuthorized = new MockAdapter(energomonitorAuthorized.getAxiosInstance());
  });

  beforeEach(() => {
    axiosMockAuthorized.reset();
  });

  describe('.constructor', () => {
    describe('with default axios instance', async () => {
      it('uses the default axios instance when no custom instance is passed', async () => {
        const energomonitor = new Energomonitor();

        expect(energomonitor.getAxiosInstance()).toBeDefined();
      });

      it('sets axios instance baseURL to the default value when no apiURL is passed', async () => {
        const energomonitor = new Energomonitor();

        expect(energomonitor.getAxiosInstance().defaults['baseURL']).toBe(
          'https://api.energomonitor.com/v1'
        );
      });

      it('sets axios instance baseURL to apiURL when apiURL is passed', async () => {
        const energomonitor = new Energomonitor(undefined, undefined, 'my.api.url');

        expect(energomonitor.getAxiosInstance().defaults['baseURL']).toBe('my.api.url');
      });
    });

    describe('with custom axios instance', async () => {
      it('uses a custom axios instance when custom instance is passed', async () => {
        const myAxiosInstance = axios.create();
        const energomonitor = new Energomonitor(undefined, myAxiosInstance);

        expect(energomonitor.getAxiosInstance()).toBe(myAxiosInstance);
      });

      it('sets axios instance baseURL to the default value when no apiURL is passed', async () => {
        const myAxiosInstance = axios.create();
        const energomonitor = new Energomonitor(undefined, myAxiosInstance);

        expect(energomonitor.getAxiosInstance().defaults['baseURL']).toBe(
          'https://api.energomonitor.com/v1'
        );
      });

      it('sets axios instance baseURL to apiURL when apiURL is passed', async () => {
        const myAxiosInstance = axios.create({
          baseURL: 'original.url'
        });
        const energomonitor = new Energomonitor(undefined, myAxiosInstance, 'my.api.url');

        expect(energomonitor.getAxiosInstance().defaults['baseURL']).toBe('my.api.url');
      });
    });
  });

  describe('.authorize', () => {
    let energomonitor;
    let axiosMock;

    beforeAll(() => {
      energomonitor = new Energomonitor();
      axiosMock = new MockAdapter(energomonitor.getAxiosInstance());
    });

    beforeEach(() => {
      axiosMock.reset();
    });

    it('sends request to the correct URL', async () => {
      axiosMock.onPost('/authorizations').reply(function(config) {
        expect(config.baseURL + config.url).toBe('https://api.energomonitor.com/v1/authorizations');

        return [200, mockData.authorization];
      });

      await energomonitor.authorize('test_user', 'test_pw');
    });

    it('does not pass unset parameters to axios config.data', async () => {
      axiosMock.onPost('/authorizations').reply(function(config) {
        expect(config.data).toBe('{}');

        return [200, mockData.authorization];
      });

      await energomonitor.authorize('test_user', 'test_pw');
    });

    it('passes the note parameter to axios config.data', async () => {
      axiosMock.onPost('/authorizations').reply(function(config) {
        expect(config.data).toBe('{"note":"test_note"}');

        return [200, mockData.authorization];
      });

      await energomonitor.authorize('test_user', 'test_pw', 'test_note');
    });

    it('passes the resources parameter to axios config.data', async () => {
      axiosMock.onPost('/authorizations').reply(function(config) {
        expect(config.data).toBe(
          '{"resources":[{"type":"feed","name":"200242",' + '"permissions":["r"]}]}'
        );

        return [200, mockData.authorization];
      });

      await energomonitor.authorize('test_user', 'test_pw', undefined, [
        {
          type: 'feed',
          name: '200242',
          permissions: ['r']
        }
      ]);
    });

    it('passes the validMinutes parameter to axios config.data', async () => {
      axiosMock.onPost('/authorizations').reply(function(config) {
        expect(config.data).toBe('{"valid_minutes":15}');

        return [200, mockData.authorization];
      });

      await energomonitor.authorize('test_user', 'test_pw', undefined, undefined, 15);
    });

    it('saves token to token request headers after successful auth', async () => {
      axiosMock.onPost('/authorizations').reply(function() {
        return [200, mockData.authorization];
      });

      await energomonitor.authorize('test_user', 'test_pw');
      expect(energomonitor._authorizedRequestHeaders).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-123456789'
      });
    });
  });

  describe('.getFeed', () => {
    it('returns a rejected promise when token is not set', () => {
      return expect(energomonitorUnauthorized.getFeed(1)).rejects.toEqual(
        'Cannot call this method without setting the authorization token ' +
          '(in the constructor or using the authorize method).'
      );
    });

    it('sends request to the correct URL', async () => {
      axiosMockAuthorized.onGet('/feeds/1').reply(function(config) {
        expect(config.baseURL + config.url).toBe('https://api.energomonitor.com/v1/feeds/1');

        return [200, mockData.feed];
      });

      await energomonitorAuthorized.getFeed(1);
    });
  });

  describe('.getFeeds', () => {
    it('returns a rejected promise when token is not set', () => {
      return expect(energomonitorUnauthorized.getFeeds(1)).rejects.toEqual(
        'Cannot call this method without setting the authorization token ' +
          '(in the constructor or using the authorize method).'
      );
    });

    it('sends request to the correct URL', async () => {
      axiosMockAuthorized.onGet('/users/1/feeds').reply(function(config) {
        expect(config.baseURL + config.url).toBe('https://api.energomonitor.com/v1/users/1/feeds');

        return [200, mockData.feeds];
      });

      await energomonitorAuthorized.getFeeds(1);
    });
  });

  describe('.getNotification', () => {
    it('returns a rejected promise when token is not set', () => {
      return expect(energomonitorUnauthorized.getNotification(1, 2)).rejects.toEqual(
        'Cannot call this method without setting the authorization token ' +
          '(in the constructor or using the authorize method).'
      );
    });

    it('sends request to the correct URL', async () => {
      axiosMockAuthorized.onGet('/users/1/notifications/2').reply(function(config) {
        expect(config.baseURL + config.url).toBe(
          'https://api.energomonitor.com/v1/users/1/notifications/2'
        );

        return [200, mockData.notification];
      });

      await energomonitorAuthorized.getNotification(1, 2);
    });
  });

  describe('.getNotificationCount', () => {
    it('returns a rejected promise when token is not set', () => {
      return expect(energomonitorUnauthorized.getNotificationCount(1)).rejects.toEqual(
        'Cannot call this method without setting the authorization token ' +
          '(in the constructor or using the authorize method).'
      );
    });

    it('sends request to the correct URL', async () => {
      axiosMockAuthorized.onGet('/users/1/notification_count').reply(function(config) {
        expect(config.baseURL + config.url).toBe(
          'https://api.energomonitor.com/v1/users/1/notification_count'
        );

        return [200, mockData.notificationCount];
      });

      await energomonitorAuthorized.getNotificationCount(1);
    });
  });

  describe('.getNotifications', () => {
    it('returns a rejected promise when token is not set', () => {
      return expect(energomonitorUnauthorized.getNotifications(1)).rejects.toEqual(
        'Cannot call this method without setting the authorization token ' +
          '(in the constructor or using the authorize method).'
      );
    });

    it('sends request to the correct URL', async () => {
      axiosMockAuthorized.onGet('/users/1/notifications').reply(function(config) {
        expect(config.baseURL + config.url).toBe(
          'https://api.energomonitor.com/v1/users/1/notifications'
        );

        return [200, mockData.notifications];
      });

      await energomonitorAuthorized.getNotifications(1);
    });

    it('does not pass unset parameters to axios config.params', async () => {
      axiosMockAuthorized.onGet('/users/1/notifications').reply(function(config) {
        expect(config.params).toEqual({});

        return [200, mockData.notifications];
      });

      await energomonitorAuthorized.getNotifications(1);
    });

    it('converts the createdAtFrom parameter to ISO 8601 and passes it to axios config.params', async () => {
      const createdAtFromDate = new Date(Date.UTC(2017, 3, 22, 16, 30, 0));
      const createdAtFromIso8601 = '2017-04-22T16:30:00.000Z';

      axiosMockAuthorized.onGet('/users/1/notifications').reply(function(config) {
        expect(config.params).toEqual({
          created_at_from: createdAtFromIso8601
        });

        return [200, mockData.notifications];
      });

      await energomonitorAuthorized.getNotifications(1, createdAtFromDate);
    });
  });

  describe('.getRelatedStreams', () => {
    it('returns a rejected promise when token is not set', () => {
      return expect(energomonitorUnauthorized.getRelatedStreams(1)).rejects.toEqual(
        'Cannot call this method without setting the authorization token ' +
          '(in the constructor or using the authorize method).'
      );
    });

    it('sends request to the correct URL', async () => {
      axiosMockAuthorized.onGet('/feeds/1/related_streams').reply(function(config) {
        expect(config.baseURL + config.url).toBe(
          'https://api.energomonitor.com/v1/feeds/1/related_streams'
        );

        return [200, mockData.relatedStreams];
      });

      await energomonitorAuthorized.getRelatedStreams(1);
    });
  });

  describe('.getStream', () => {
    it('returns a rejected promise when token is not set', () => {
      return expect(energomonitorUnauthorized.getStream(1, 2)).rejects.toEqual(
        'Cannot call this method without setting the authorization token ' +
          '(in the constructor or using the authorize method).'
      );
    });

    it('sends request to the correct URL', async () => {
      axiosMockAuthorized.onGet('/feeds/1/streams/2').reply(function(config) {
        expect(config.baseURL + config.url).toBe(
          'https://api.energomonitor.com/v1/feeds/1/streams/2'
        );

        return [200, mockData.stream];
      });

      await energomonitorAuthorized.getStream(1, 2);
    });
  });

  describe('.getStreamData', () => {
    it('returns a rejected promise when token is not set', () => {
      return expect(energomonitorUnauthorized.getStreamData(1, 2)).rejects.toEqual(
        'Cannot call this method without setting the authorization token ' +
          '(in the constructor or using the authorize method).'
      );
    });

    it('sends request to the correct URL', async () => {
      axiosMockAuthorized.onGet('/feeds/1/streams/2/data').reply(function(config) {
        expect(config.baseURL + config.url).toBe(
          'https://api.energomonitor.com/v1/feeds/1/streams/2/data'
        );

        return [200, mockData.streamData];
      });

      await energomonitorAuthorized.getStreamData(1, 2);
    });

    it('does not pass unset parameters to axios config.params', async () => {
      axiosMockAuthorized.onGet('/feeds/1/streams/2/data').reply(function(config) {
        expect(config.params).toEqual({});

        return [200, mockData.streamData];
      });

      await energomonitorAuthorized.getStreamData(1, 2);
    });

    it('converts the timeFrom parameter to a timestamp and passes it to axios config.params', async () => {
      // 12-Oct-15 05:10:00 UTC = timestamp 1444626600
      const timeFromDate = new Date(Date.UTC(2015, 9, 12, 5, 10, 0));
      const timeFromTimestamp = 1444626600;

      axiosMockAuthorized.onGet('/feeds/1/streams/2/data').reply(function(config) {
        expect(config.params).toEqual({
          time_from: timeFromTimestamp
        });

        return [200, mockData.streamData];
      });

      await energomonitorAuthorized.getStreamData(1, 2, timeFromDate);
    });

    it('converts the timeTo parameter to a timestamp and passes it to axios config.params', async () => {
      // 10-Dec-15 07:50:20 UTC = timestamp 1449733820
      const timeToDate = new Date(Date.UTC(2015, 11, 10, 7, 50, 20));
      const timeToTimestamp = 1449733820;

      axiosMockAuthorized.onGet('/feeds/1/streams/2/data').reply(function(config) {
        expect(config.params).toEqual({
          time_to: timeToTimestamp
        });

        return [200, mockData.streamData];
      });

      await energomonitorAuthorized.getStreamData(1, 2, undefined, timeToDate);
    });

    it('passes the limit parameter to axios config.params', async () => {
      axiosMockAuthorized.onGet('/feeds/1/streams/2/data').reply(function(config) {
        expect(config.params).toEqual({
          limit: 50
        });

        return [200, mockData.streamData];
      });

      await energomonitorAuthorized.getStreamData(1, 2, undefined, undefined, 50);
    });
  });

  describe('.getStreams', () => {
    it('returns a rejected promise when token is not set', () => {
      return expect(energomonitorUnauthorized.getStreams(1)).rejects.toEqual(
        'Cannot call this method without setting the authorization token ' +
          '(in the constructor or using the authorize method).'
      );
    });

    it('sends request to the correct URL', async () => {
      axiosMockAuthorized.onGet('/feeds/1/streams').reply(function(config) {
        expect(config.baseURL + config.url).toBe(
          'https://api.energomonitor.com/v1/feeds/1/streams'
        );

        return [200, mockData.streams];
      });

      await energomonitorAuthorized.getStreams(1);
    });

    it('does not pass unset parameters to axios config.params', async () => {
      axiosMockAuthorized.onGet('/feeds/1/streams').reply(function(config) {
        expect(config.params).toEqual({});

        return [200, mockData.streams];
      });

      await energomonitorAuthorized.getStreams(1);
    });

    it('passes the types parameter to axios config.params', async () => {
      axiosMockAuthorized.onGet('/feeds/1/streams').reply(function(config) {
        expect(config.params).toEqual({
          type: ['raw', 'processed']
        });

        return [200, mockData.streams];
      });

      await energomonitorAuthorized.getStreams(1, ['raw', 'processed']);
    });

    it('passes the channels parameter to axios config.params', async () => {
      axiosMockAuthorized.onGet('/feeds/1/streams').reply(function(config) {
        expect(config.params).toEqual({ channel: [1, 2, 3] });

        return [200, mockData.streams];
      });

      await energomonitorAuthorized.getStreams(1, undefined, [1, 2, 3]);
    });

    it('converts the dataTimeFrom parameter to a timestamp and passes it to axios config.params', async () => {
      // 28-Oct-17 20:29:40 UTC = timestamp 1509222580
      const dataTimeFromDate = new Date(Date.UTC(2017, 9, 28, 20, 29, 40));
      const dataTimeFromTimestamp = 1509222580;

      axiosMockAuthorized.onGet('/feeds/1/streams').reply(function(config) {
        expect(config.params).toEqual({
          data_time_from: dataTimeFromTimestamp
        });

        return [200, mockData.streams];
      });

      await energomonitorAuthorized.getStreams(1, undefined, undefined, dataTimeFromDate);
    });

    it('converts the dataTimeTo parameter to a timestamp and passes it to axios config.params', async () => {
      // 04-May-18 09:12:21 UTC = timestamp 1525425141
      const dataTimeToDate = new Date(Date.UTC(2018, 4, 4, 9, 12, 21));
      const dataTimeToTimestamp = 1525425141;

      axiosMockAuthorized.onGet('/feeds/1/streams').reply(function(config) {
        expect(config.params).toEqual({
          data_time_to: dataTimeToTimestamp
        });

        return [200, mockData.streams];
      });

      await energomonitorAuthorized.getStreams(1, undefined, undefined, undefined, dataTimeToDate);
    });
  });

  describe('.getUser', () => {
    it('returns a rejected promise when token is not set', () => {
      return expect(energomonitorUnauthorized.getUser(1)).rejects.toEqual(
        'Cannot call this method without setting the authorization token ' +
          '(in the constructor or using the authorize method).'
      );
    });

    it('sends request to the correct URL', async () => {
      axiosMockAuthorized.onGet('/users/1').reply(function(config) {
        expect(config.baseURL + config.url).toBe('https://api.energomonitor.com/v1/users/1');

        return [200, mockData.user];
      });

      await energomonitorAuthorized.getUser(1);
    });
  });

  describe('.updateNotification', () => {
    it('returns a rejected promise when token is not set', () => {
      return expect(energomonitorUnauthorized.updateNotification(1, 2)).rejects.toEqual(
        'Cannot call this method without setting the authorization token ' +
          '(in the constructor or using the authorize method).'
      );
    });

    it('sends request to the correct URL', async () => {
      axiosMockAuthorized.onPatch('/users/1/notifications/2').reply(function(config) {
        expect(config.baseURL + config.url).toBe(
          'https://api.energomonitor.com/v1/users/1/notifications/2'
        );

        return [200, mockData.notification];
      });

      await energomonitorAuthorized.updateNotification(1, 2);
    });

    it('does not pass unset parameters to axios config.data', async () => {
      axiosMockAuthorized.onPatch('/users/1/notifications/2').reply(function(config) {
        expect(config.data).toBeUndefined();

        return [200, mockData.notification];
      });

      await energomonitorAuthorized.updateNotification(1, 2);
    });
  });

  describe('.updateNotifications', () => {
    it('returns a rejected promise when token is not set', () => {
      return expect(energomonitorUnauthorized.updateNotifications(1)).rejects.toEqual(
        'Cannot call this method without setting the authorization token ' +
          '(in the constructor or using the authorize method).'
      );
    });

    it('sends request to the correct URL', async () => {
      axiosMockAuthorized.onPatch('/users/1/notifications').reply(function(config) {
        expect(config.baseURL + config.url).toBe(
          'https://api.energomonitor.com/v1/users/1/notifications'
        );

        return [205];
      });

      await energomonitorAuthorized.updateNotifications(1);
    });
  });
});
