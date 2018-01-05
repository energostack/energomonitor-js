# Energomonitor

[Energomonitor API](https://developers.energomonitor.com/api/) JavaScript client.

## Installation

```console
$ npm install energomonitor
```

The client should work both in Node.js and in most modern browsers (when bundled using Webpack or some similar tool).

Note the client uses ES6 promises. In environments that don’t support them, you may need to use a polyfill (such as [es6-promise](https://github.com/stefanpenner/es6-promise)).

## Usage

First, require the library:

```javascript
const Energomonitor = require('energomonitor');
```

Now you need to create an instance of `Energomonitor`, which represents an interaction session with the Energomonitor API. Since API requests are authenticated with an access token, you have two options:

  1. If you already have the token available, you can just create the instance and pass the token to the constructor:

     ```javascript
     const token = /* ... */;

     const em = new Energomonitor(token);
     ```

  2. If you don’t have the token available, you can create the instance without it and use the `authorize` method to generate the token using your username and password:

     ```javascript
     const em = new Energomonitor();

     const username = /* ... */;
     const password = /* ... */;

     em.authorize(username, password)
         .then(authorization => {
             const token = authorization.token;
             const expiresAt = authorization.expires_at;

             // Save the token and expiration time here and continue using the
             // `Energomonitor` instance.
         };
     ```

In both cases, the token will be saved internally in the instance and it will be used by its methods to authenticate API requests. For more details about authentication, see [Authentication](https://developers.energomonitor.com/api/overview.html#authentication) in the Energomonitor API documentation.

Once you have the `Energomonitor` instance ready, you can start using the API. Here is a simple example which lists all feeds of a user with ID `usfgw` (when running the example, replace the ID with your own):

```javascript
em.getFeeds('usfgw')
    .then(feeds => {
        feeds.forEach((feed, index) => {
            console.log(`Feed #${index + 1}: ${feed.id}`);
        });
    })
    .catch(e => {
        console.error(e.message);
    });
```

The output will be something like this:

```
Feed #1: embahs
Feed #2: emdvij
```

In general, `Energomonitor` methods correspond to API endpoints and return a promise. For successful requests, the promise will resolve to the value returned by the API (or `null` for endpoints that don’t return any value). For unsuccessful requests, the promise will be rejected with the error returned by the API. For a list of possible errors, see [Client errors](https://developers.energomonitor.com/api/overview.html#client-errors) in the Energomonitor API documentation.

For a complete list of `Energomonitor` methods and their description, see the API documentation below.

## API

<a name="Energomonitor"></a>

## Energomonitor
Represents an interaction session with the Energomonitor API.

**Kind**: global class

* [Energomonitor](#Energomonitor)
    * [new Energomonitor([token], [axiosInstance], [apiURL])](#new_Energomonitor_new)
    * [.authorize(username, password, [note], [resources], [validMinutes])](#Energomonitor+authorize) ⇒ <code>Promise</code>
    * [.getUser(userId)](#Energomonitor+getUser) ⇒ <code>Promise</code>
    * [.getFeeds(userId)](#Energomonitor+getFeeds) ⇒ <code>Promise</code>
    * [.getFeed(feedId)](#Energomonitor+getFeed) ⇒ <code>Promise</code>
    * [.getStreams(feedId, [types], [channels], [dataTimeFrom], [dataTimeTo])](#Energomonitor+getStreams) ⇒ <code>Promise</code>
    * [.getStream(feedId, streamId)](#Energomonitor+getStream) ⇒ <code>Promise</code>
    * [.getStreamData(feedId, streamId, [timeFrom], [timeTo], [limit])](#Energomonitor+getStreamData) ⇒ <code>Promise</code>
    * [.getRelatedStreams(feedId)](#Energomonitor+getRelatedStreams) ⇒ <code>Promise</code>
    * [.getNotifications(userId, [createdAtFrom])](#Energomonitor+getNotifications) ⇒ <code>Promise</code>
    * [.getNotification(userId, notificationId)](#Energomonitor+getNotification) ⇒ <code>Promise</code>
    * [.updateNotifications(userId, [data])](#Energomonitor+updateNotifications) ⇒ <code>Promise</code>
    * [.updateNotification(userId, notificationId, [data])](#Energomonitor+updateNotification) ⇒ <code>Promise</code>
    * [.getNotificationCount(userId)](#Energomonitor+getNotificationCount) ⇒ <code>Promise</code>
    * [.getAxiosInstance()](#Energomonitor+getAxiosInstance) ⇒ <code>Object</code>

<a name="new_Energomonitor_new"></a>

### new Energomonitor([token], [axiosInstance], [apiURL])
Create a new instance of `Energomonitor`.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [token] | <code>string</code> |  | Access token to authenticate the requests with. Use this parameter in case you already generated a token in the past and now you wish to use it, otherwise generate the token using [authorize](#Energomonitor+authorize). |
| [axiosInstance] | <code>Axios</code> |  | Custom axios instance to be used for handling HTTP requests. When not passed, the client will create its own instance. |
| [apiURL] | <code>string</code> | <code>&quot;https://api.energomonitor.com/v1&quot;</code> | Energomonitor API URL. |

<a name="Energomonitor+authorize"></a>

### energomonitor.authorize(username, password, [note], [resources], [validMinutes]) ⇒ <code>Promise</code>
Create a new authorization for a user. Return an authorization object
containing an access token. The token will be saved internally in the
instance and it will subsequently be used by all other methods.

**Kind**: instance method of [<code>Energomonitor</code>](#Energomonitor)

**Returns**: <code>Promise</code> - A promise that resolves to the
[authorization object](https://developers.energomonitor.com/api/endpoints/authorization.html#authorization-object).

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | Username used for HTTP Basic authentication. |
| password | <code>string</code> | Password used for HTTP Basic authentication. |
| [note] | <code>string</code> | User note for the created authorization. |
| [resources] | <code>Array.&lt;Object&gt;</code> | List of [resources](https://developers.energomonitor.com/api/endpoints/authorization.html#resource-object) associated with the created authorization. Default: all resources the user is authorized to access. |
| [validMinutes] | <code>integer</code> | How long from now should the created authorization be valid, in minutes.|

<a name="Energomonitor+getUser"></a>

### energomonitor.getUser(userId) ⇒ <code>Promise</code>
Retrieve a single user.

**Kind**: instance method of [<code>Energomonitor</code>](#Energomonitor)

**Returns**: <code>Promise</code> - A promise that resolves to the
[user object](https://developers.energomonitor.com/api/endpoints/users.html#user-object).

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | Retrieve a user with this ID. |

<a name="Energomonitor+getFeeds"></a>

### energomonitor.getFeeds(userId) ⇒ <code>Promise</code>
Retrieve a list of all user’s feeds.

**Kind**: instance method of [<code>Energomonitor</code>](#Energomonitor)

**Returns**: <code>Promise</code> - A promise that resolves to the array of
[feed objects](https://developers.energomonitor.com/api/endpoints/feeds-streams.html#feed-object).

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | Retrieve feeds of a user with this ID. |

<a name="Energomonitor+getFeed"></a>

### energomonitor.getFeed(feedId) ⇒ <code>Promise</code>
Retrieve a single feed.

**Kind**: instance method of [<code>Energomonitor</code>](#Energomonitor)

**Returns**: <code>Promise</code> - A promise that resolves to the
[feed object](https://developers.energomonitor.com/api/endpoints/feeds-streams.html#feed-object).

| Param | Type | Description |
| --- | --- | --- |
| feedId | <code>string</code> | Retrieve a feed with this ID. |

<a name="Energomonitor+getStreams"></a>

### energomonitor.getStreams(feedId, [types], [channels], [dataTimeFrom], [dataTimeTo]) ⇒ <code>Promise</code>
Retrieve a list of streams belonging to a feed.

**Kind**: instance method of [<code>Energomonitor</code>](#Energomonitor)

**Returns**: <code>Promise</code> - A promise that resolves to the array of
[stream objects](https://developers.energomonitor.com/api/endpoints/feeds-streams.html#stream-object).

| Param | Type | Description |
| --- | --- | --- |
| feedId | <code>string</code> | Retrieve streams belonging to a feed with this ID. |
| [types] | <code>string</code> \| <code>Array.&lt;string&gt;</code> | Only list streams of this type/types. See the description of [stream objects](https://developers.energomonitor.com/api/endpoints/feeds-streams.html#stream-object) for more details about stream types. |
| [channels] | <code>integer</code> \| <code>Array.&lt;integer&gt;</code> | Only list streams with this channel/channels. See the description of [stream objects](https://developers.energomonitor.com/api/endpoints/feeds-streams.html#stream-object) for more details about channels. |
| [dataTimeFrom] | <code>Date</code> | Only list streams with data points measured after or at this time. |
| [dataTimeTo] | <code>Date</code> | Only list streams with data points measured before or at this time. |

<a name="Energomonitor+getStream"></a>

### energomonitor.getStream(feedId, streamId) ⇒ <code>Promise</code>
Retrieve a single stream.

**Kind**: instance method of [<code>Energomonitor</code>](#Energomonitor)

**Returns**: <code>Promise</code> - A promise that resolves to the
[stream object](https://developers.energomonitor.com/api/endpoints/feeds-streams.html#stream-object)).

| Param | Type | Description |
| --- | --- | --- |
| feedId | <code>string</code> | Retrieve a stream belonging to a feed with this ID. |
| streamId | <code>string</code> | Retrieve a stream with this ID. |

<a name="Energomonitor+getStreamData"></a>

### energomonitor.getStreamData(feedId, streamId, [timeFrom], [timeTo], [limit]) ⇒ <code>Promise</code>
Retrieve a list of a stream’s data points.

**Kind**: instance method of [<code>Energomonitor</code>](#Energomonitor)

**Returns**: <code>Promise</code> - A promise that resolves to the array with the data
points where each data point is an array with 2 elements: the time of
measurement (`integer`, a Unix timestamp) and a value (`integer |
float`). See the
[`GET /feeds/{feed_id}/streams/{stream_id}/data`](https://developers.energomonitor.com/api/endpoints/feeds-streams.html#get-feeds-feed-id-streams-stream-id-data)
endpoint description for more details.

| Param | Type | Description |
| --- | --- | --- |
| feedId | <code>string</code> | Retrieve data points of a stream belonging to a feed with this ID. |
| streamId | <code>string</code> | Retrieve data of a stream with this ID. |
| [timeFrom] | <code>Date</code> | Only list data points measured after or at this time. |
| [timeTo] | <code>Date</code> | Only list data points measured before or at this time. |
| [limit] | <code>integer</code> | Maximum number of returned data points. When there are more matching data points than limit, the newest ones are returned. |

<a name="Energomonitor+getRelatedStreams"></a>

### energomonitor.getRelatedStreams(feedId) ⇒ <code>Promise</code>
Retrieve a list of related streams.

**Kind**: instance method of [<code>Energomonitor</code>](#Energomonitor)

**Returns**: <code>Promise</code> - A promise that resolves to the array with the groups,
where each group is an array with stream IDs identifying streams that
belong to the group. See the
[`GET /feeds/{feed_id}/related_stream`](https://developers.energomonitor.com/api/endpoints/feeds-streams.html#get-feeds-feed-id-related-streams),
endpoint description for more details.

| Param | Type | Description |
| --- | --- | --- |
| feedId | <code>string</code> | Retrieve related streams of a feed with this ID. |

<a name="Energomonitor+getNotifications"></a>

### energomonitor.getNotifications(userId, [createdAtFrom]) ⇒ <code>Promise</code>
Retrieve a list of user’s notifications.

**Kind**: instance method of [<code>Energomonitor</code>](#Energomonitor)

**Returns**: <code>Promise</code> - A promise that resolves to the array of
[notification objects](https://developers.energomonitor.com/api/endpoints/notifications.html#notification-object).

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | Retrieve notifications of a user with this ID. |
| [createdAtFrom] | <code>Date</code> | Only list notifications created at or after this time. |

<a name="Energomonitor+getNotification"></a>

### energomonitor.getNotification(userId, notificationId) ⇒ <code>Promise</code>
Retrieve a single notification.

**Kind**: instance method of [<code>Energomonitor</code>](#Energomonitor)

**Returns**: <code>Promise</code> - A promise that resolves to the
[notification object](https://developers.energomonitor.com/api/endpoints/notifications.html#notification-object).

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | Retrieve a notification of a user with this ID. |
| notificationId | <code>string</code> | Retrieve a notification with this ID. |

<a name="Energomonitor+updateNotifications"></a>

### energomonitor.updateNotifications(userId, [data]) ⇒ <code>Promise</code>
Modify user’s notifications.

**Kind**: instance method of [<code>Energomonitor</code>](#Energomonitor)

**Returns**: <code>Promise</code> - A promise that resolves to null.

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | Modify notifications of a user with this ID. |
| [data] | <code>Object</code> | An object with one of the following properties (their semantics is the same as in a [notification object](https://developers.energomonitor.com/api/endpoints/notifications.html#notification-object)): `read` (`boolean`). For example, `{ read: true }` or `{ read: false }`. |

<a name="Energomonitor+updateNotification"></a>

### energomonitor.updateNotification(userId, notificationId, [data]) ⇒ <code>Promise</code>
Modify a single notification.

**Kind**: instance method of [<code>Energomonitor</code>](#Energomonitor)

**Returns**: <code>Promise</code> - A promise that resolves to the modified
[notification object](https://developers.energomonitor.com/api/endpoints/notifications.html#notification-object).

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | Modify a notification of a user with this ID. |
| notificationId | <code>string</code> | Modify a notification with this ID. |
| [data] | <code>Object</code> | An object with one of the following properties (their semantics is the same as in a [notification object](https://developers.energomonitor.com/api/endpoints/notifications.html#notification-object)): `read` (`boolean`), `archived` (`boolean`). For example, `{ read: true, archived: false }` or `{ read: false }`.|

<a name="Energomonitor+getNotificationCount"></a>

### energomonitor.getNotificationCount(userId) ⇒ <code>Promise</code>
Retrieve notification count information.

**Kind**: instance method of [<code>Energomonitor</code>](#Energomonitor)

**Returns**: <code>Promise</code> - A promise that resolves to an object with `read`,
`unread` and `total` properties. See the
[`GET /users/{user_id}/notification_count`](https://developers.energomonitor.com/api/endpoints/notifications.html#get-users-user-id-notification-count)
endpoint description for more details.

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | Retrieve notification count information of a user with this ID. |

<a name="Energomonitor+getAxiosInstance"></a>

### energomonitor.getAxiosInstance() ⇒ <code>Object</code>
Return the axios instance used by this client.

**Kind**: instance method of [<code>Energomonitor</code>](#Energomonitor)

**Returns**: <code>Object</code> - The axios instance used by this client.

## Development

### Unit tests

The client is tested using a small [Jest](https://facebook.github.io/jest/) test suite.

Run tests:

```console
$ npm run test
```

Run tests in verbose mode:

```console
$ npm run test-verbose
```

### Code style

We use [Prettier](https://github.com/prettier/prettier) together with [prettier-eslint](https://github.com/prettier/prettier-eslint).

Please always use the format script before committing:

```console
$ npm run format
```
