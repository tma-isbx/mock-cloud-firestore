'use strict';

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _collectionReference = require('./firebase/firestore/collection-reference');

var _collectionReference2 = _interopRequireDefault(_collectionReference);

var _documentReference = require('./firebase/firestore/document-reference');

var _documentReference2 = _interopRequireDefault(_documentReference);

var _documentSnapshot = require('./firebase/firestore/document-snapshot');

var _documentSnapshot2 = _interopRequireDefault(_documentSnapshot);

var _fieldValue = require('./firebase/firestore/field-value');

var _fieldValue2 = _interopRequireDefault(_fieldValue);

var _firestore = require('./firebase/firestore');

var _firestore2 = _interopRequireDefault(_firestore);

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _querySnapshot = require('./firebase/firestore/query-snapshot');

var _querySnapshot2 = _interopRequireDefault(_querySnapshot);

var _query = require('./firebase/firestore/query');

var _query2 = _interopRequireDefault(_query);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _fixtureData = require('./utils/test-helpers/fixture-data');

var _fixtureData2 = _interopRequireDefault(_fixtureData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let mockFirebase;

QUnit.module('Unit | mock-cloud-firestore', hooks => {
        hooks.beforeEach(() => {
                mockFirebase = new _2.default((0, _fixtureData2.default)());
        });

        QUnit.module('CollectionReference', () => {
                QUnit.module('getter/setter: id', () => {
                        QUnit.test('should return collection identifier', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').id;

                                // Assert
                                assert.equal(result, 'users');
                        });
                });

                QUnit.module('getter/setter: firestore', () => {
                        QUnit.test('should return the firestore the collection is in', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').firestore;

                                // Assert
                                assert.ok(result instanceof _firestore2.default);
                        });
                });

                QUnit.module('getter/setter: parent', () => {
                        QUnit.test('should return DocumentReference if this is a subcollection', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').doc('user_a').collection('friends').parent;

                                // Assert
                                assert.ok(result instanceof _documentReference2.default);
                        });

                        QUnit.test('should return null if there is no parent', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').parent;

                                // Assert
                                assert.equal(result, null);
                        });
                });

                QUnit.module('function: add', () => {
                        QUnit.test('should add a new document', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const ref = await db.collection('users').add({ username: 'new_user' });

                                // Assert
                                const snapshot = await ref.get();

                                assert.deepEqual(snapshot.data(), { username: 'new_user' });
                        });
                });

                QUnit.module('function: doc', () => {
                        QUnit.test('should return the document reference using an ID', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').doc('user_a');

                                // Assert
                                assert.ok(result instanceof _documentReference2.default);
                        });

                        QUnit.test('should return the document reference using a path', assert => {
                                assert.expect(2);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').doc('user_a/friends/user_b');

                                // Assert
                                assert.ok(result instanceof _documentReference2.default);
                                assert.equal(result.id, 'user_b');
                        });

                        QUnit.test('should throw an error when getting doc reference on an odd number of segment', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                try {
                                        // Act
                                        db.collection('users').doc('user_a/friends');
                                } catch (error) {
                                        // Assert
                                        assert.equal(error.message, 'Invalid document reference. Document references must have an even number of segments, but users/user_a/friends has 3.');
                                }
                        });

                        QUnit.test('should create document reference when not providing an ID', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').doc();

                                // Assert
                                assert.ok(result.id);
                        });
                });

                QUnit.module('function: endAt', () => {
                        QUnit.test('should return an instance of Query', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').orderBy('age').endAt(15);

                                // Assert
                                assert.ok(result instanceof _query2.default);
                        });
                });

                QUnit.module('function: endBefore', () => {
                        QUnit.test('should return an instance of Query', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').orderBy('age').endBefore(15);

                                // Assert
                                assert.ok(result instanceof _query2.default);
                        });
                });

                QUnit.module('function: get', () => {
                        QUnit.test('should return the query snapshot', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = await db.collection('users').get();

                                // Assert
                                assert.ok(result instanceof _querySnapshot2.default);
                        });
                });

                QUnit.module('function: limit', () => {
                        QUnit.test('should return an instance of Query', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').orderBy('age').limit(15);

                                // Assert
                                assert.ok(result instanceof _query2.default);
                        });
                });

                QUnit.module('function: onSnapshot', () => {
                        QUnit.test('should return a function for unsubscribing', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').onSnapshot(() => {});

                                // Assert
                                assert.ok(typeof result === 'function');
                        });

                        QUnit.test('should fire callback', assert => {
                                assert.expect(1);

                                // Arrange
                                const done = assert.async();
                                const db = mockFirebase.firestore();

                                // Act
                                db.collection('users').onSnapshot(snapshot => {
                                        // Assert
                                        assert.ok(snapshot instanceof _querySnapshot2.default);
                                        done();
                                });
                        });
                });

                QUnit.module('function: orderBy', () => {
                        QUnit.test('should return an instance of Query', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').orderBy('age');

                                // Assert
                                assert.ok(result instanceof _query2.default);
                        });
                });

                QUnit.module('function: startAfter', () => {
                        QUnit.test('should return an instance of Query', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').orderBy('age').startAfter(15);

                                // Assert
                                assert.ok(result instanceof _query2.default);
                        });
                });

                QUnit.module('function: startAt', () => {
                        QUnit.test('should return an instance of Query', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').orderBy('age').startAt(15);

                                // Assert
                                assert.ok(result instanceof _query2.default);
                        });
                });

                QUnit.module('function: where', () => {
                        QUnit.test('should return an instance of Query', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').orderBy('age').where('name', '==', 'Foo');

                                // Assert
                                assert.ok(result instanceof _query2.default);
                        });
                });
        });

        QUnit.module('DocumentReference', () => {
                QUnit.module('getter/setter: id', () => {
                        QUnit.test('should return document identifier', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').doc('user_a').id;

                                // Assert
                                assert.equal(result, 'user_a');
                        });
                });

                QUnit.module('getter/setter: firestore', () => {
                        QUnit.test('should return the firestore the document is in', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').doc('user_a').firestore;

                                // Assert
                                assert.ok(result instanceof _firestore2.default);
                        });
                });

                QUnit.module('getter/setter: parent', () => {
                        QUnit.test('should return CollectionReference of which the DocumentReference belongs to', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').doc('user_a').parent;

                                // Assert
                                assert.ok(result instanceof _collectionReference2.default);
                        });
                });

                QUnit.module('function: collection', () => {
                        QUnit.test('should return the collection reference of an ID', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').doc('user_a').collection('friends');

                                // Assert
                                assert.ok(result instanceof _collectionReference2.default);
                        });

                        QUnit.test('should return the collection reference of a path', assert => {
                                assert.expect(2);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').doc('user_a').collection('friends/user_b/wew_so_deep');

                                // Assert
                                assert.ok(result instanceof _collectionReference2.default);
                                assert.equal(result.id, 'wew_so_deep');
                        });

                        QUnit.test('should throw an error when getting collection reference on an even number of segment', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                try {
                                        // Act
                                        db.collection('users').doc('user_a').collection('friends/user_b');
                                } catch (error) {
                                        // Assert
                                        assert.equal(error.message, 'Invalid collection reference. Collection references must have an odd number of segments, but users/user_a/friends/user_b has 4.');
                                }
                        });
                });

                QUnit.module('function: delete', () => {
                        QUnit.test('should delete the document', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const ref = db.collection('users').doc('user_a');

                                // Act
                                await ref.delete();

                                // Assert
                                const record = await ref.get();

                                assert.equal(record.exists, false);
                        });

                        QUnit.test('should delete the document coming from a query', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const querySnapshot = await db.collection('users').where('age', '==', 15).get();

                                // Act
                                querySnapshot.forEach(async docSnapshot => {
                                        await docSnapshot.ref.delete();
                                });

                                // Assert
                                const docSnapshot = await db.collection('users').doc('user_a').get();

                                assert.equal(docSnapshot.exists, false);
                        });
                });

                QUnit.module('function: get', () => {
                        QUnit.test('should return the document snapshot', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = await db.collection('users').doc('user_a').get();

                                // Assert
                                assert.ok(result instanceof _documentSnapshot2.default);
                        });
                });

                QUnit.module('function: onSnapshot', () => {
                        QUnit.test('should return a function for unsubscribing', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').doc('user_a').onSnapshot(() => {});

                                // Assert
                                assert.ok(typeof result === 'function');
                        });

                        QUnit.test('should fire callback', assert => {
                                assert.expect(1);

                                // Arrange
                                const done = assert.async();
                                const db = mockFirebase.firestore();

                                // Act
                                db.collection('users').doc('user_a').onSnapshot(snapshot => {
                                        // Assert
                                        assert.ok(snapshot instanceof _documentSnapshot2.default);
                                        done();
                                });
                        });
                });

                QUnit.module('function: set', () => {
                        QUnit.test('should set the data using the default options when it exist', async assert => {
                                assert.expect(3);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const ref = db.collection('users').doc('user_a');

                                // Act
                                await ref.set({
                                        name: 'user_a',
                                        dad: db.collection('users').doc('user_b'),
                                        modifiedOn: _firebase2.default.firestore.FieldValue.serverTimestamp()
                                });

                                // Assert
                                const snapshot = await ref.get();
                                const { dad, modifiedOn, name } = snapshot.data();

                                assert.deepEqual(dad, db.collection('users').doc('user_b'));
                                assert.ok(modifiedOn.toDate() instanceof Date);
                                assert.equal(name, 'user_a');
                        });

                        QUnit.test('should set the data using the default options when it does not exists', async assert => {
                                assert.expect(3);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const ref = db.collection('users').doc('user_100');

                                // Act
                                await ref.set({
                                        dad: db.collection('users').doc('user_b'),
                                        modifiedOn: _firebase2.default.firestore.FieldValue.serverTimestamp(),
                                        username: 'user_100'
                                });

                                // Assert
                                const snapshot = await ref.get();
                                const { dad, modifiedOn, username } = snapshot.data();

                                assert.deepEqual(dad, db.collection('users').doc('user_b'));
                                assert.ok(modifiedOn.toDate() instanceof Date);
                                assert.equal(username, 'user_100');
                        });

                        QUnit.test('should set the data using the merge option', async assert => {
                                assert.expect(7);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const ref = db.collection('users').doc('user_a');

                                // Act
                                await ref.set({
                                        dad: db.collection('users').doc('user_b'),
                                        modifiedOn: _firebase2.default.firestore.FieldValue.serverTimestamp(),
                                        name: 'user_a'
                                }, { merge: true });

                                // Assert
                                const snapshot = await ref.get();
                                const {
                                        address,
                                        age,
                                        createdOn,
                                        dad,
                                        modifiedOn,
                                        name,
                                        username
                                } = snapshot.data();

                                assert.deepEqual(address, { home: 'San Francisco', work: 'Silicon Valley' });
                                assert.equal(age, 15);
                                assert.deepEqual(createdOn.toDate(), new Date('2017-01-01'));
                                assert.deepEqual(dad, db.collection('users').doc('user_b'));
                                assert.ok(modifiedOn.toDate() instanceof Date);
                                assert.equal(name, 'user_a');
                                assert.equal(username, 'user_a');
                        });
                });

                QUnit.module('function: update', () => {
                        QUnit.test('should update the data', async assert => {
                                assert.expect(9);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const ref = db.collection('users').doc('user_a');

                                // Act
                                await ref.update({
                                        dad: db.collection('users').doc('user_b'),
                                        modifiedOn: _firebase2.default.firestore.FieldValue.serverTimestamp(),
                                        pinnedBooks: _firebase2.default.firestore.FieldValue.arrayUnion('book_100'),
                                        pinnedFoods: _firebase2.default.firestore.FieldValue.arrayRemove('food_1'),
                                        name: 'user_a'
                                });

                                // Assert
                                const snapshot = await ref.get();
                                const {
                                        address,
                                        age,
                                        createdOn,
                                        dad,
                                        modifiedOn,
                                        name,
                                        pinnedBooks,
                                        pinnedFoods,
                                        username
                                } = snapshot.data();

                                assert.deepEqual(address, { home: 'San Francisco', work: 'Silicon Valley' });
                                assert.equal(age, 15);
                                assert.deepEqual(createdOn.toDate(), new Date('2017-01-01'));
                                assert.deepEqual(dad, db.collection('users').doc('user_b'));
                                assert.ok(modifiedOn.toDate() instanceof Date);
                                assert.equal(name, 'user_a');
                                assert.deepEqual(pinnedBooks, ['book_1', 'book_2', 'book_100']);
                                assert.deepEqual(pinnedFoods, ['food_2']);
                                assert.equal(username, 'user_a');
                        });

                        QUnit.test('should throw error when updating data that does not exist', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const ref = db.collection('users').doc('user_100');

                                try {
                                        // Act
                                        await ref.update({ name: 'user_100' });
                                } catch (e) {
                                        // Assert
                                        assert.ok(true);
                                }
                        });
                });
        });

        QUnit.module('DocumentSnapshot', () => {
                QUnit.module('getter/setter: exists', () => {
                        QUnit.test('should return true if data exists', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').doc('user_a').get();

                                // Act
                                const result = snapshot.exists;

                                // Assert
                                assert.equal(result, true);
                        });

                        QUnit.test('should return false if data does not exists', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').doc('user_100').get();

                                // Act
                                const result = snapshot.exists;

                                // Assert
                                assert.equal(result, false);
                        });
                });

                QUnit.module('getter/setter: id', () => {
                        QUnit.test('should return the identifier', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').doc('user_a').get();

                                // Act
                                const result = snapshot.id;

                                // Assert
                                assert.equal(result, 'user_a');
                        });
                });

                QUnit.module('getter/setter: ref', () => {
                        QUnit.test('should return the DocumentReference', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').doc('user_a').get();

                                // Act
                                const result = snapshot.ref;

                                // Assert
                                assert.ok(result instanceof _documentReference2.default);
                        });
                });

                QUnit.module('function: get', () => {
                        QUnit.test('should return the specific field', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').doc('user_a').get();

                                // Act
                                const result = snapshot.get('age');

                                // Assert
                                assert.equal(result, 15);
                        });

                        QUnit.test('should return the reference type field', async assert => {
                                assert.expect(3);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').doc('user_a').collection('friends').doc('user_b').get();

                                // Act
                                const reference = snapshot.get('reference');

                                // Assert
                                const referenceSnapshot = await reference.get();
                                const { age, createdOn, username } = referenceSnapshot.data();

                                assert.equal(age, 10);
                                assert.deepEqual(createdOn.toDate(), new Date('2017-01-01'));
                                assert.equal(username, 'user_b');
                        });

                        QUnit.test('should return the specific field using dot notation', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').doc('user_a').get();

                                // Act
                                const result = snapshot.get('address.home');

                                // Assert
                                assert.equal(result, 'San Francisco');
                        });

                        QUnit.test('should return undefined when field does not exist', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').doc('user_a').get();

                                // Act
                                const result = snapshot.get('foobar');

                                // Assert
                                assert.equal(result, undefined);
                        });
                });

                QUnit.module('function: data', () => {
                        QUnit.test('should return the data', async assert => {
                                assert.expect(4);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').doc('user_a').get();

                                // Act
                                const {
                                        address,
                                        age,
                                        createdOn,
                                        username
                                } = snapshot.data();

                                // Assert
                                assert.deepEqual(address, { home: 'San Francisco', work: 'Silicon Valley' });
                                assert.equal(age, 15);
                                assert.deepEqual(createdOn.toDate(), new Date('2017-01-01'));
                                assert.equal(username, 'user_a');
                        });

                        QUnit.test('should return the data and match any reference type field appropriately', async assert => {
                                assert.expect(3);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').doc('user_a').collection('friends').doc('user_b').get();

                                // Act
                                const { reference } = snapshot.data();

                                // Assert
                                const referenceSnapshot = await reference.get();
                                const { age, createdOn, username } = referenceSnapshot.data();

                                assert.equal(age, 10);
                                assert.deepEqual(createdOn.toDate(), new Date('2017-01-01'));
                                assert.equal(username, 'user_b');
                        });

                        QUnit.test('should return undefined when data does not exist', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').doc('user_100').get();

                                // Act
                                const result = snapshot.data();

                                // Assert
                                assert.equal(result, undefined);
                        });
                });
        });

        QUnit.module('FieldValue', () => {
                QUnit.module('function: arrayUnion', () => {
                        QUnit.test('should return an array union representation', assert => {
                                assert.expect(1);

                                // Act
                                const result = mockFirebase.firestore.FieldValue.arrayUnion('foo', 'bar');

                                // Assert
                                assert.deepEqual(result, {
                                        _methodName: 'FieldValue.arrayUnion',
                                        _elements: ['foo', 'bar']
                                });
                        });
                });

                QUnit.module('function: arrayRemove', () => {
                        QUnit.test('should return an array union representation', assert => {
                                assert.expect(1);

                                // Act
                                const result = mockFirebase.firestore.FieldValue.arrayRemove('foo', 'bar');

                                // Assert
                                assert.deepEqual(result, {
                                        _methodName: 'FieldValue.arrayRemove',
                                        _elements: ['foo', 'bar']
                                });
                        });
                });

                QUnit.module('function: serverTimestamp', () => {
                        QUnit.test('should return a server timestamp representation', assert => {
                                assert.expect(1);

                                // Act
                                const result = mockFirebase.firestore.FieldValue.serverTimestamp();

                                // Assert
                                assert.deepEqual(result, { _methodName: 'FieldValue.serverTimestamp' });
                        });
                });
        });

        QUnit.module('Firestore', () => {
                QUnit.module('static getter/setter: FieldValue', () => {
                        QUnit.test('should return an instance of FieldValue', assert => {
                                assert.expect(1);

                                // Act
                                const result = mockFirebase.firestore.FieldValue;

                                // Assert
                                assert.ok(result instanceof _fieldValue2.default);
                        });
                });

                QUnit.module('function: collection', () => {
                        QUnit.test('should return the collection reference using a path', assert => {
                                assert.expect(2);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users/user_a/friends');

                                // Assert
                                assert.ok(result instanceof _collectionReference2.default);
                                assert.equal(result.id, 'friends');
                        });

                        QUnit.test('should throw an error when getting collection reference on an even number of segment', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                try {
                                        // Act
                                        db.collection('users/user_a');
                                } catch (error) {
                                        // Assert
                                        assert.equal(error.message, 'Invalid collection reference. Collection references must have an odd number of segments, but users/user_a has 2.');
                                }
                        });
                });

                QUnit.module('function: doc', () => {
                        QUnit.test('should return the document reference using a path', assert => {
                                assert.expect(2);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.doc('users/user_a');

                                // Assert
                                assert.ok(result instanceof _documentReference2.default);
                                assert.equal(result.id, 'user_a');
                        });

                        QUnit.test('should throw an error when getting doc reference on an even number of segment', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                try {
                                        // Act
                                        db.doc('users/user_a/friends');
                                } catch (error) {
                                        // Assert
                                        assert.equal(error.message, 'Invalid document reference. Document references must have an even number of segments, but users/user_a/friends has 3.');
                                }
                        });
                });
        });

        QUnit.module('QuerySnapshot', () => {
                QUnit.module('getter/setter: docs', () => {
                        QUnit.test('should return the documents for the query snapshot', async assert => {
                                assert.expect(3);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').get();

                                // Act
                                const result = snapshot.docs;

                                // Assert
                                assert.equal(result[0].id, 'user_a');
                                assert.equal(result[1].id, 'user_b');
                                assert.equal(result[2].id, 'user_c');
                        });
                });

                QUnit.module('getter/setter: empty', () => {
                        QUnit.test('should return true when there are no documents', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('foobar').get();

                                // Act
                                const result = snapshot.empty;

                                // Assert
                                assert.equal(result, true);
                        });

                        QUnit.test('should return false when there are documents', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').get();

                                // Act
                                const result = snapshot.empty;

                                // Assert
                                assert.equal(result, false);
                        });
                });

                QUnit.module('getter/setter: size', () => {
                        QUnit.test('should return the number of documents for the query snapshot', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').get();

                                // Act
                                const result = snapshot.size;

                                // Assert
                                assert.equal(result, 3);
                        });
                });

                QUnit.module('function: forEach', () => {
                        QUnit.test('should fire callback per each data', async assert => {
                                assert.expect(1);

                                // Arrange
                                const stub = _sinon2.default.stub();
                                const db = mockFirebase.firestore();
                                const snapshot = await db.collection('users').get();

                                // Act
                                snapshot.forEach(stub);

                                // Assert
                                assert.ok(stub.calledThrice);
                        });
                });
        });

        QUnit.module('Query', () => {
                QUnit.module('getter/setter: firestore', () => {
                        QUnit.test('should return the firestore the query is in', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').limit(1).firestore;

                                // Assert
                                assert.ok(result instanceof _firestore2.default);
                        });
                });

                QUnit.module('function: endAt', () => {
                        QUnit.test('should return documents satisfying the query', async assert => {
                                assert.expect(3);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const snapshot = await db.collection('users').orderBy('age').endAt(15).get();

                                // Assert
                                assert.equal(snapshot.docs.length, 2);
                                assert.equal(snapshot.docs[0].id, 'user_b');
                                assert.equal(snapshot.docs[1].id, 'user_a');
                        });

                        QUnit.test('should error when not doing orderBy()', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                try {
                                        // Act
                                        await db.collection('users').endAt(15).get();
                                } catch (e) {
                                        // Assert
                                        assert.ok(true);
                                }
                        });
                });

                QUnit.module('function: endBefore', () => {
                        QUnit.test('should return documents satisfying the query', async assert => {
                                assert.expect(2);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const snapshot = await db.collection('users').orderBy('age').endBefore(15).get();

                                // Assert
                                assert.equal(snapshot.docs.length, 1);
                                assert.equal(snapshot.docs[0].id, 'user_b');
                        });

                        QUnit.test('should error when not doing orderBy()', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                try {
                                        // Act
                                        await db.collection('users').endBefore(15).get();
                                } catch (e) {
                                        // Assert
                                        assert.ok(true);
                                }
                        });
                });

                QUnit.module('function: limit', () => {
                        QUnit.test('should return documents satisfying the query', async assert => {
                                assert.expect(3);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const snapshot = await db.collection('users').limit(2).get();

                                // Assert
                                assert.equal(snapshot.docs.length, 2);
                                assert.equal(snapshot.docs[0].id, 'user_a');
                                assert.equal(snapshot.docs[1].id, 'user_b');
                        });
                });

                QUnit.module('function: onSnapshot', () => {
                        QUnit.test('should return a function for unsubscribing', assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const result = db.collection('users').orderBy('age').onSnapshot(() => {});

                                // Assert
                                assert.ok(typeof result === 'function');
                        });

                        QUnit.test('should fire callback', assert => {
                                assert.expect(1);

                                // Arrange
                                const done = assert.async();
                                const db = mockFirebase.firestore();

                                // Act
                                db.collection('users').orderBy('age').onSnapshot(snapshot => {
                                        // Assert
                                        assert.ok(snapshot instanceof _querySnapshot2.default);
                                        done();
                                });
                        });
                });

                QUnit.module('function: orderBy', () => {
                        QUnit.test('should return documents satisfying the query', async assert => {
                                assert.expect(3);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const snapshot = await db.collection('users').orderBy('age').get();

                                // Assert
                                assert.equal(snapshot.docs[0].id, 'user_b');
                                assert.equal(snapshot.docs[1].id, 'user_a');
                                assert.equal(snapshot.docs[2].id, 'user_c');
                        });
                });

                QUnit.module('function: startAfter', () => {
                        QUnit.test('should return documents satisfying the query', async assert => {
                                assert.expect(2);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const snapshot = await db.collection('users').orderBy('age').startAfter(15).get();

                                // Assert
                                assert.equal(snapshot.docs.length, 1);
                                assert.equal(snapshot.docs[0].id, 'user_c');
                        });

                        QUnit.test('should error when not doing orderBy()', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                try {
                                        // Act
                                        await db.collection('users').startAfter(15).get();
                                } catch (e) {
                                        // Assert
                                        assert.ok(true);
                                }
                        });
                });

                QUnit.module('function: startAt', () => {
                        QUnit.test('should return documents satisfying the query', async assert => {
                                assert.expect(3);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const snapshot = await db.collection('users').orderBy('age').startAt(15).get();

                                // Assert
                                assert.equal(snapshot.docs.length, 2);
                                assert.equal(snapshot.docs[0].id, 'user_a');
                                assert.equal(snapshot.docs[1].id, 'user_c');
                        });

                        QUnit.test('should error when not doing orderBy()', async assert => {
                                assert.expect(1);

                                // Arrange
                                const db = mockFirebase.firestore();

                                try {
                                        // Act
                                        await db.collection('users').startAt(15).get();
                                } catch (e) {
                                        // Assert
                                        assert.ok(true);
                                }
                        });
                });

                QUnit.module('function: where', () => {
                        QUnit.test('should return documents satisfying the query', async assert => {
                                assert.expect(2);

                                // Arrange
                                const db = mockFirebase.firestore();

                                // Act
                                const snapshot = await db.collection('users').where('age', '==', 15).get();

                                // Assert
                                assert.equal(snapshot.docs.length, 1);
                                assert.equal(snapshot.docs[0].id, 'user_a');
                        });
                });
        });

        QUnit.module('WriteBatch', () => {
                QUnit.module('function: commit', () => {
                        QUnit.test('should commit all of the writes in the write batch', async assert => {
                                assert.expect(7);

                                // Arrange
                                const db = mockFirebase.firestore();
                                const batch = db.batch();
                                const ref1 = db.collection('users').doc();
                                const ref2 = db.collection('users').doc('user_a');
                                const ref3 = db.collection('users').doc('user_b');
                                const ref4 = db.collection('users').doc('user_100');

                                batch.set(ref1, { username: 'new_user' });
                                batch.delete(ref2);
                                batch.update(ref3, { name: 'user-b' });
                                batch.set(ref4, { username: 'user_100' });

                                // Act
                                await batch.commit();

                                // Assert
                                const snapshot1 = await ref1.get();
                                const snapshot2 = await ref2.get();
                                const snapshot3 = await ref3.get();
                                const snapshot4 = await ref4.get();

                                assert.deepEqual(snapshot1.data(), { username: 'new_user' });
                                assert.equal(snapshot2.exists, false);

                                const {
                                        age: snapshot3Age,
                                        createdOn: snapshot3CreatedOn,
                                        name: snapshot3Name,
                                        username: snapshot3Username
                                } = snapshot3.data();

                                assert.equal(snapshot3Age, 10);
                                assert.deepEqual(snapshot3CreatedOn.toDate(), new Date('2017-01-01'));
                                assert.equal(snapshot3Name, 'user-b');
                                assert.equal(snapshot3Username, 'user_b');
                                assert.deepEqual(snapshot4.data(), { username: 'user_100' });
                        });
                });
        });
});