(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.MockFirebase = factory());
}(this, (function () { 'use strict';

  class FieldValue {
    arrayUnion(...args) {
      return {
        _methodName: 'FieldValue.arrayUnion',
        _elements: [...args]
      };
    }

    arrayRemove(...args) {
      return {
        _methodName: 'FieldValue.arrayRemove',
        _elements: [...args]
      };
    }

    delete() {
      return {
        _methodName: 'FieldValue.delete'
      };
    }

    increment(operand) {
      return {
        _methodName: 'FieldValue.increment',
        _operand: operand
      };
    }

    serverTimestamp() {
      return {
        _methodName: 'FieldValue.serverTimestamp'
      };
    }

  }

  function buildPathFromReference(ref) {
    let url = '';
    let currentRef = ref;
    let hasParentRef = true;

    while (hasParentRef) {
      if (currentRef.id) {
        url = `${currentRef.id}/${url}`;

        if (!currentRef.parent) {
          hasParentRef = false;
        }

        currentRef = currentRef.parent;
      } else {
        break;
      }
    }

    return `__ref__:${url.slice(0, -1)}`;
  }
  function cleanPath(path) {
    if (path.startsWith('/')) {
      // Remove staring slash
      return path.substr(1);
    }

    return path;
  }
  function validatePath(path) {
    if (path.includes('//')) {
      throw new Error(`Invalid path (${path}). Paths must not contain // in them.`);
    }
  }

  class DocumentSnapshot {
    constructor(id, data, ref) {
      this._id = id;
      this._data = data;
      this._ref = ref;
    }

    get exists() {
      const data = this._data;
      return !(data.__isDirty__ || data.__isDeleted__);
    }

    get id() {
      return this._id;
    }

    get ref() {
      return this._ref;
    }

    data() {
      return this.exists ? this._getData() : undefined;
    }

    get(path) {
      if (!this.exists) {
        return undefined;
      }

      const keys = path.split('.');

      let data = this._getData();

      for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          data = data[key];
        } else {
          data = undefined;
          break;
        }
      }

      return data;
    }

    _getData() {
      const data = { ...this._data
      };

      for (const key of Object.keys(data)) {
        if (typeof data[key] === 'string' && data[key].startsWith('__ref__:')) {
          data[key] = this._buildRefFromPath(this.ref.firestore, data[key].replace('__ref__:', ''));
        } else if (data[key] instanceof Date) {
          const date = data[key];
          data[key] = {
            toDate() {
              return date;
            }

          };
        }
      }

      delete data.__isDirty__;
      delete data.__collection__;
      return data;
    }

    _buildRefFromPath(db, path) {
      const nodes = path.split('/');
      let ref = db;
      nodes.forEach((node, index) => {
        if (node) {
          if (index % 2 === 0) {
            ref = ref.collection(node);
          } else {
            ref = ref.doc(node);
          }
        }
      });
      return ref;
    }

  }

  /* eslint no-param-reassign: 'off' */
  function getOrSetDataNode(data, path, id) {
    if (!Object.prototype.hasOwnProperty.call(data, path)) {
      data[path] = {};
    }

    if (!Object.prototype.hasOwnProperty.call(data[path], id)) {
      if (path === '__collection__') {
        data[path][id] = {};
      } else {
        data[path][id] = {
          __isDirty__: true
        };
      }
    }

    return data[path][id];
  }

  /* eslint no-use-before-define: ['error', 'nofunc'] */

  function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
  }

  function isFieldValue(value) {
    return isObject(value) && Object.prototype.hasOwnProperty.call(value, '_methodName');
  }

  function validateValue(value, option) {
    if (isObject(value)) {
      const newOption = { ...option,
        isInObject: true
      };
      Object.keys(value).forEach(key => validateValue(value[key], newOption));
    }

    if (Array.isArray(value)) {
      const newOption = { ...option,
        isInArray: true
      };
      value.forEach(item => validateValue(item, newOption));
    }

    if (value === undefined) {
      throw new Error(`Function DocumentReference.${option.type}() called with invalid data. Unsupported field value: undefined (found in field ${option.field})`);
    }

    if (isFieldValue(value)) {
      const {
        _methodName: methodName
      } = value;

      if (methodName === 'FieldValue.delete') {
        if (option.type === 'add' || option.type === 'set:merge-false') {
          throw new Error(`Function DocumentReference.set() called with invalid data. FieldValue.delete() cannot be used with set() unless you pass {merge:true} (found in field ${option.field})`);
        }

        if (option.type === 'update' && option.isInObject) {
          throw new Error(`Function DocumentReference.update() called with invalid data. FieldValue.delete() can only appear at the top level of your update data (found in field ${option.field})`);
        }
      }

      if (methodName === 'FieldValue.increment' && option.type === 'set:merge-false') {
        throw new Error(`Function DocumentReference.set() called with invalid data. FieldValue.increment() cannot be used with set() unless you pass {merge:true} (found in field ${option.field})`);
      }

      if (option.isInArray) {
        throw new Error(`Function DocumentReference.${option.type}() called with invalid data. ${methodName} is not currently supported inside arrays`);
      }
    }
  }

  function processArrayUnion(arrayUnion, oldArray = []) {
    const newArray = [...oldArray];

    arrayUnion._elements.forEach(unionItem => {
      if (!newArray.find(item => item === unionItem)) {
        newArray.push(unionItem);
      }
    });

    return newArray;
  }

  function processArrayRemove(arrayRemove, oldArray = []) {
    let newArray = [...oldArray];

    arrayRemove._elements.forEach(unionItem => {
      newArray = newArray.filter(item => item !== unionItem);
    });

    return newArray;
  }

  function processIncrement(incrementOperation, oldValue) {
    const {
      _operand: operand
    } = incrementOperation;

    if (typeof oldValue !== 'number') {
      return operand;
    }

    return oldValue + operand;
  }

  function processFieldValue(newValue, oldValue) {
    const {
      _methodName: methodName
    } = newValue;

    if (methodName === 'FieldValue.serverTimestamp') {
      return new Date();
    }

    if (methodName === 'FieldValue.arrayUnion') {
      return processArrayUnion(newValue, oldValue);
    }

    if (methodName === 'FieldValue.arrayRemove') {
      return processArrayRemove(newValue, oldValue);
    }

    if (methodName === 'FieldValue.increment') {
      return processIncrement(newValue, oldValue);
    }

    return '__FieldValue.delete__';
  }

  function processObject(newValue, oldValue, option) {
    if (option.type === 'set:merge-true') {
      const mergedValue = { ...oldValue,
        ...newValue
      };
      Object.keys(newValue).forEach(key => {
        const oldObjectKeyValue = isObject(oldValue) ? oldValue[key] : undefined;
        mergedValue[key] = parseValue(newValue[key], oldObjectKeyValue, option);

        if (mergedValue[key] === '__FieldValue.delete__') {
          delete mergedValue[key];
        }
      });
      return mergedValue;
    }

    const newObjectValue = { ...newValue
    };
    Object.keys(newValue).forEach(key => {
      newObjectValue[key] = parseValue(newValue[key], undefined, option);

      if (newObjectValue[key] === '__FieldValue.delete__') {
        delete newObjectValue[key];
      }
    });
    return newObjectValue;
  }

  function parseValue(newValue, oldValue, option) {
    validateValue(newValue, option);

    if (newValue instanceof DocumentReference) {
      return buildPathFromReference(newValue);
    }

    if (isFieldValue(newValue)) {
      return processFieldValue(newValue, oldValue);
    }

    if (isObject(newValue)) {
      return processObject(newValue, oldValue, option);
    }

    return newValue;
  }

  function validateReference(ref, type) {
    const path = buildPathFromReference(ref).substr(8);
    const pathNodes = path.split('/');

    if (type === 'collection' && pathNodes.length % 2 !== 1) {
      throw new Error(`Invalid collection reference. Collection references must have an odd number of segments, but ${path} has ${pathNodes.length}.`);
    } else if (type === 'doc' && pathNodes.length % 2 !== 0) {
      throw new Error(`Invalid document reference. Document references must have an even number of segments, but ${path} has ${pathNodes.length}.`);
    }
  }

  class DocumentReference {
    constructor(id, data, parent, firestore) {
      this._id = id;
      this._data = data;
      this._parent = parent;
      this._firestore = firestore;
    }

    get id() {
      return this._id;
    }

    get firestore() {
      return this._firestore;
    }

    get parent() {
      return this._parent;
    }

    collection(id) {
      return this._getCollectionReference(id);
    }

    getCollections() {
      if (this._data.__collection__ === undefined) {
        return Promise.resolve([]);
      }

      const collectionIds = Object.keys(this._data.__collection__);
      const collectionReferences = collectionIds.map(id => this._getCollectionReference(id));
      return Promise.resolve(collectionReferences);
    }

    listCollections() {
      return this.getCollections();
    }

    delete() {
      if (this._data) {
        this._data.__isDirty__ = false;
        this._data.__isDeleted__ = true;
      }

      return Promise.resolve();
    }

    get() {
      const documentSnapshot = new DocumentSnapshot(this._id, this._data, this);
      return Promise.resolve(documentSnapshot);
    }

    onSnapshot(onNext) {
      const documentSnapshot = new DocumentSnapshot(this._id, this._data, this);
      setTimeout(() => onNext(documentSnapshot), 10);
      return this._firestore._onSnapshot(() => {
        onNext(documentSnapshot);
      });
    }

    set(data, option = {}) {
      if (!option.merge) {
        Object.keys(this._data).forEach(key => {
          if (key !== '__collection__') {
            delete this._data[key];
          }
        });
      }

      Object.assign(this._data, this._parseDataForSet(data, option), {
        __isDirty__: false
      });

      this._firestore._dataChanged();

      return Promise.resolve();
    }

    update(data) {
      if (this._data.__isDirty__ || this._data.__isDeleted__) {
        throw new Error('Document doesn\'t exist');
      }

      Object.assign(this._data, this._parseDataForUpdate(data));

      this._firestore._dataChanged();

      return Promise.resolve();
    }

    _collection(id) {
      const data = getOrSetDataNode(this._data, '__collection__', id);
      return new CollectionReference(id, data, this, this.firestore);
    }

    _getCollectionReference(path) {
      validatePath(path);
      const cleanedPath = cleanPath(path);
      const nodes = cleanedPath.split('/');
      let ref = this;
      nodes.forEach((node, index) => {
        if (index % 2 === 0) {
          ref = ref._collection(node);
        } else {
          ref = ref.doc(node);
        }
      });
      validateReference(ref, 'collection');
      return ref;
    }

    _processNestedField(keys, value, currentData) {
      let currentNewDataNode = {};
      let currentOldDataNode;
      let rootDataNode;
      keys.forEach((key, index) => {
        if (index === 0) {
          currentNewDataNode[key] = currentData[key] || {};
          currentNewDataNode = currentNewDataNode[key];
          currentOldDataNode = currentData[key] || {};
          rootDataNode = currentNewDataNode;
        } else if (index < keys.length - 1) {
          currentNewDataNode[key] = currentOldDataNode[key] || {};
          currentNewDataNode = currentNewDataNode[key];
          currentOldDataNode = currentOldDataNode[key] || {};
        } else {
          const newValue = parseValue(value, currentOldDataNode[key], {
            type: 'update'
          });

          if (newValue === undefined) {
            delete currentNewDataNode[key];
          } else {
            currentNewDataNode[key] = newValue;
          }
        }
      });
      return rootDataNode;
    }

    _parseDataForSet(newData, option) {
      const parsedData = { ...this._data
      };
      Object.keys(newData).forEach(key => {
        parsedData[key] = parseValue(newData[key], parsedData[key], {
          type: `set:merge-${option.merge || false}`
        });
      });
      return this._removeDeletedFields(parsedData);
    }

    _parseDataForUpdate(newData) {
      const parsedData = { ...this._data
      };
      Object.keys(newData).forEach(key => {
        const keyNodes = key.split('.');

        if (keyNodes.length > 1) {
          parsedData[keyNodes[0]] = { ...this._processNestedField(keyNodes, newData[key], parsedData)
          };
        } else {
          parsedData[keyNodes[0]] = parseValue(newData[key], parsedData[key], {
            type: 'update'
          });
        }
      });
      return this._removeDeletedFields(parsedData);
    }

    _removeDeletedFields(data) {
      const newData = { ...data
      };
      Object.keys(data).forEach(key => {
        const field = newData[key];

        if (field === '__FieldValue.delete__') {
          delete newData[key];
          delete this._data[key];
        } else if (Object.prototype.toString.call(field) === '[object Object]') {
          newData[key] = this._removeDeletedFields(field);
        }
      });
      return newData;
    }

  }

  class QuerySnapshot {
    constructor(data) {
      this._data = data;
    }

    get docs() {
      return this._data;
    }

    get empty() {
      return this._data.length === 0;
    }

    get size() {
      return this._data.length;
    }

    forEach(callback) {
      for (const data of this._data) {
        callback(data);
      }
    }

  }

  function filterByCursor(data, prop, value, cursor) {
    const filteredData = {};
    const ids = Object.keys(data).filter(id => {
      if (cursor === 'endAt') {
        return data[id][prop] <= value;
      }

      if (cursor === 'endBefore') {
        return data[id][prop] < value;
      }

      if (cursor === 'startAfter') {
        return data[id][prop] > value;
      }

      return data[id][prop] >= value;
    });

    for (const id of ids) {
      filteredData[id] = data[id];
    }

    return filteredData;
  }

  function getPathValue(data, field) {
    const keys = field.split('.');
    let pathValue;
    keys.forEach(key => {
      if (pathValue) {
        pathValue = pathValue[key];
      } else {
        pathValue = data[key];
      }
    });
    return pathValue;
  }

  function endAt(data, prop, value) {
    return filterByCursor(data, prop, value, 'endAt');
  }
  function endBefore(data, prop, value) {
    return filterByCursor(data, prop, value, 'endBefore');
  }
  function limit(data, threshold) {
    const filteredData = {};
    const ids = Object.keys(data).slice(0, threshold);

    for (const id of ids) {
      filteredData[id] = data[id];
    }

    return filteredData;
  }
  function orderBy(data, key, order) {
    const filteredData = {};
    let ids;

    if (order === 'desc') {
      ids = Object.keys(data).slice().sort((a, b) => {
        if (typeof data[a][key] === 'number') {
          return data[b][key] - data[a][key];
        }

        if (data[a][key] > data[b][key]) {
          return -1;
        }

        if (data[a][key] < data[b][key]) {
          return 1;
        }

        return 0;
      });
    } else {
      ids = Object.keys(data).slice().sort((a, b) => {
        if (typeof data[a][key] === 'number') {
          return data[a][key] - data[b][key];
        }

        if (data[a][key] < data[b][key]) {
          return -1;
        }

        if (data[a][key] > data[b][key]) {
          return 1;
        }

        return 0;
      });
    }

    for (const id of ids) {
      filteredData[id] = data[id];
    }

    return filteredData;
  }
  function startAfter(data, prop, value) {
    return filterByCursor(data, prop, value, 'startAfter');
  }
  function startAt(data, prop, value) {
    return filterByCursor(data, prop, value, 'startAt');
  }
  function where(data = {}, key, operator, value) {
    const filteredData = {};
    const ids = Object.keys(data).filter(id => {
      // Allow us to handle nested values
      const pathValue = getPathValue(data[id], key);

      if (operator === '<') {
        return pathValue < value;
      }

      if (operator === '<=') {
        return pathValue <= value;
      }

      if (operator === '==') {
        if (value instanceof DocumentReference) {
          return pathValue && pathValue.startsWith('__ref__:') && pathValue === buildPathFromReference(value);
        }

        return pathValue === value;
      }

      if (operator === '>=') {
        return pathValue >= value;
      }

      if (operator === 'array-contains') {
        return (pathValue || []).find(item => item === value);
      }

      if (operator === 'array-contains-any') {
        return (pathValue || []).find(item => value.includes(item));
      }

      if (operator === 'in') {
        return value.includes(pathValue);
      }

      return pathValue > value;
    });

    for (const id of ids) {
      filteredData[id] = data[id];
    }

    return filteredData;
  }
  function querySnapshot(data, collection) {
    const documentSnapshots = [];

    if (data && Object.prototype.hasOwnProperty.call(data, '__doc__')) {
      for (const key of Object.keys(data.__doc__)) {
        const documentRecord = data.__doc__[key];

        if (!documentRecord.__isDeleted__ && !documentRecord.__isDirty__) {
          const documentReference = new DocumentReference(key, documentRecord, collection, collection.firestore);
          const documentSnapshot = new DocumentSnapshot(key, documentRecord, documentReference);
          documentSnapshots.push(documentSnapshot);
        }
      }
    }

    const snapshot = new QuerySnapshot(documentSnapshots);
    return snapshot;
  }

  class Query {
    constructor(data, collection) {
      this._data = data;
      this._collection = collection;
      this._operations = [];
    }

    _querySnapshot() {
      const data = {
        __doc__: {},
        ...this._data
      };

      this._operations.forEach(operation => {
        if (operation.type === 'orderBy') {
          data.__doc__ = orderBy(data.__doc__, operation.param.key, operation.param.sorting);
        }

        if (operation.type === 'startAt') {
          data.__doc__ = startAt(data.__doc__, operation.param.order.key, operation.param.value);
        }

        if (operation.type === 'startAfter') {
          data.__doc__ = startAfter(data.__doc__, operation.param.order.key, operation.param.value);
        }

        if (operation.type === 'endAt') {
          data.__doc__ = endAt(data.__doc__, operation.param.order.key, operation.param.value);
        }

        if (operation.type === 'endBefore') {
          data.__doc__ = endBefore(data.__doc__, operation.param.order.key, operation.param.value);
        }

        if (operation.type === 'limit') {
          data.__doc__ = limit(data.__doc__, operation.param.value);
        }

        if (operation.type === 'where') {
          data.__doc__ = where(data.__doc__, operation.param.key, operation.param.operator, operation.param.value);
        }
      });

      return data;
    }

    get firestore() {
      return this._collection.firestore;
    }

    endAt(value) {
      const order = this._getOrder();

      if (!order) {
        throw new Error('endAt() queries requires orderBy()');
      }

      this._operations.push({
        type: 'endAt',
        param: {
          value,
          order
        }
      });

      return this;
    }

    endBefore(value) {
      const order = this._getOrder();

      if (!order) {
        throw new Error('endBefore() queries requires orderBy()');
      }

      this._operations.push({
        type: 'endBefore',
        param: {
          value,
          order
        }
      });

      return this;
    }

    get() {
      return Promise.resolve(querySnapshot(this._querySnapshot(), this._collection));
    }

    limit(value) {
      this._operations.push({
        type: 'limit',
        param: {
          value
        }
      });

      return this;
    }

    onSnapshot(onNext) {
      setTimeout(() => onNext(querySnapshot(this._querySnapshot(), this._collection)), 10);
      return this.firestore._onSnapshot(() => {
        onNext(querySnapshot(this._querySnapshot(), this._collection));
      });
    }

    orderBy(key, sorting) {
      this._operations.push({
        type: 'orderBy',
        param: {
          key,
          sorting
        }
      });

      return this;
    }

    select() {
      // basically a noop, doesn't really filter
      return this;
    }

    startAfter(value) {
      const order = this._getOrder();

      if (!order) {
        throw new Error('startAfter() queries requires orderBy()');
      }

      this._operations.push({
        type: 'startAfter',
        param: {
          value,
          order
        }
      });

      return this;
    }

    startAt(value) {
      const order = this._getOrder();

      if (!order) {
        throw new Error('startAt() queries requires orderBy()');
      }

      this._operations.push({
        type: 'startAt',
        param: {
          value,
          order
        }
      });

      return this;
    }

    where(key, operator, value) {
      this._operations.push({
        type: 'where',
        param: {
          key,
          operator,
          value
        }
      });

      return this;
    }

    _getOrder() {
      return this._operations.find(operation => operation.type === 'orderBy').param;
    }

  }

  function generateIdForRecord() {
    return Math.random().toString(32).slice(2).substr(0, 5);
  }

  class CollectionReference {
    constructor(id, data, parent, firestore) {
      this._id = id;
      this._data = data;
      this._parent = parent;
      this._firestore = firestore;
    }

    get id() {
      return this._id;
    }

    get firestore() {
      return this._firestore;
    }

    get parent() {
      return this._parent;
    }

    async add(data) {
      const id = generateIdForRecord();
      const dataNode = getOrSetDataNode(this._data, '__doc__', id);
      const ref = new DocumentReference(id, dataNode, this, this._firestore);
      await ref.set(data);
      return ref;
    }

    doc(id = generateIdForRecord()) {
      return this._getDocumentReference(id);
    }

    endAt(...args) {
      return new Query(this._data, this).endAt(...args);
    }

    endBefore(...args) {
      return new Query(this._data, this).endBefore(...args);
    }

    get() {
      return Promise.resolve(querySnapshot(this._data, this));
    }

    limit(...args) {
      return new Query(this._data, this).limit(...args);
    }

    onSnapshot(onNext) {
      setTimeout(() => onNext(querySnapshot(this._data, this)), 10);
      return this._firestore._onSnapshot(() => {
        onNext(querySnapshot(this._data, this));
      });
    }

    orderBy(...args) {
      return new Query(this._data, this).orderBy(...args);
    }

    select() {
      // doesn't really filter fields
      return new Query(this._data, this);
    }

    startAfter(...args) {
      return new Query(this._data, this).startAfter(...args);
    }

    startAt(...args) {
      return new Query(this._data, this).startAt(...args);
    }

    where(...args) {
      return new Query(this._data, this).where(...args);
    }

    _doc(id) {
      const data = getOrSetDataNode(this._data, '__doc__', id);
      return new DocumentReference(id, data, this, this._firestore);
    }

    _getDocumentReference(path) {
      validatePath(path);
      const cleanedPath = cleanPath(path);
      const nodes = cleanedPath.split('/');
      let ref = this;
      nodes.forEach((node, index) => {
        if (index % 2 === 0) {
          ref = ref._doc(node);
        } else {
          ref = ref.collection(node);
        }
      });
      validateReference(ref, 'doc');
      return ref;
    }

  }

  /* eslint no-await-in-loop: off */
  class WriteBatch {
    constructor() {
      this._writeBatch = [];
    }

    async commit() {
      for (const write of this._writeBatch) {
        switch (write.type) {
          case 'set':
            await write.ref.set(write.data, write.option);
            break;

          case 'update':
            await write.ref.update(write.data);
            break;

          case 'delete':
            await write.ref.delete();
            break;
        }
      }
    }

    delete(ref) {
      this._writeBatch.push({
        type: 'delete',
        ref
      });
    }

    set(ref, data, option = {}) {
      this._writeBatch.push({
        ref,
        data,
        option,
        type: 'set'
      });
    }

    update(ref, data) {
      this._writeBatch.push({
        type: 'update',
        ref,
        data
      });
    }

  }

  class TransactionWriteBatch {
    delete(ref) {
      return ref.delete();
    }

    set(ref, data, option = {}) {
      return ref.set(data, option);
    }

    update(ref, data) {
      return ref.update(data);
    }

    get(ref) {
      return ref.get();
    }

  }

  class Firestore {
    constructor(data, options) {
      this._data = data;
      this._options = options || {};
      this._listeners = [];
    }

    _dataChanged() {
      if (this._options.isNaiveSnapshotListenerEnabled) {
        const listeners = this._listeners.splice(0);

        setTimeout(() => listeners.forEach(listener => listener()), 10);
      }
    }

    _onSnapshot(listener) {
      if (this._options.isNaiveSnapshotListenerEnabled) {
        this._listeners.push(listener);

        return () => {
          if (this._listeners.indexOf(listener) > -1) {
            this._listeners.splice(this._listeners.indexOf(listener), 1);
          }
        };
      }

      return () => {};
    }

    batch() {
      return new WriteBatch();
    }

    runTransaction(executor) {
      return executor(new TransactionWriteBatch());
    }

    collection(id) {
      return this._getReference(id, 'collection');
    }

    doc(id) {
      return this._getReference(id, 'doc');
    }

    settings(settings) {
      this._settings = settings;
    }

    _collection(id) {
      const data = getOrSetDataNode(this._data, '__collection__', id);
      return new CollectionReference(id, data, null, this);
    }

    _getReference(path, type) {
      validatePath(path);
      const cleanedPath = cleanPath(path);
      const nodes = cleanedPath.split('/');
      let ref = this;
      nodes.forEach((node, index) => {
        if (index % 2 === 0) {
          if (ref.batch) {
            ref = ref._collection(node);
          } else {
            ref = ref.collection(node);
          }
        } else {
          ref = ref.doc(node);
        }
      });
      validateReference(ref, type);
      return ref;
    }

  }

  class MockFirebase {
    constructor(data = {}, options) {
      this._data = data;
      this._options = options;
      this.firestore.FieldValue = new FieldValue();
    }

    initializeApp() {
      return this;
    }

    firestore() {
      return new Firestore(this._data, this._options);
    }

  }

  return MockFirebase;

})));
