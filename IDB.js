/**
 * strore name:表名  primaryKey:主键 ,cursorIndex 索引
 */

/**
 * example
 * const indexDB = new IDB('testindexed', {
      modelStore: {
        primaryKey: 'filename',
        name: 'modelStore'
      }
    })
 */

class IDB {
  // indexedDB兼容
  indexedDB =
    window.indexedDB ||
    window.webkitindexedDB ||
    window.msIndexedDB ||
    window.mozIndexedDB
  dbVersion = 1
  constructor (dbName, store) {
    this.dbName = dbName
    this.store = store
    this.db = null
  }
  getDB () {
    const dbName = this.dbName
    if (this.db) return Promise.resolve(this.db)
    return new Promise((resolve, reject) => {
      const request = this.indexedDB.open(dbName, this.dbVersion)
      const handlerResolve = () => {
        this.db = request.result
        resolve(request.result)
      }
      this.handlerRequest(request, handlerResolve, reject)
      const that = this
      request.onupgradeneeded = function (event) {
        const db = event.target.result
        for (const t in that.store) {
          if (!db.objectStoreNames.contains(that.store[t].name)) {
            const objectStore = db.createObjectStore(that.store[t].name, {
              keyPath: that.store[t].primaryKey,
              autoIncrement: false
            })
            const cursorIndex = that.store[t].cursorIndex
            if (cursorIndex) {
              for (let i = 0, len = cursorIndex.length; i < len; i++) {
                const element = cursorIndex[i]
                objectStore.createIndex(element.name, element.name, {
                  unique: element.unique
                })
              }
            }
          }
        }
        this.db = db
      }
    })
  }
  // 删除数据库
  destroy () {
    if (!this.db) throw new Error(`can't destroy, database has'nt createed`)
    return new Promise((resolve, reject) => {
      const deleteQuest = this.indexedDB.deleteDatabase(this.dbName)
      this.handlerRequest(deleteQuest, resolve, reject)
    })
  }
  // 关闭数据库
  close () {
    return this.getDB()
      .then(db => {
        db.close()
      })
  }
  deleteObjectStore (tableName) { // 删除表
    return this.getDB()
      .then(db => {
        db.deleteObjectStore(tableName)
      })
  }
  getValue (db, tableName, keyValue, indexCursor) { // 获取表中某条数据
    return new Promise((resolve, reject) => {
      const store = db
        .transaction(tableName, 'readonly')
        .objectStore(tableName)
      const request = indexCursor
        ? store.index(indexCursor).get(keyValue)
        : store.get(keyValue)
      const hanlderResolve = (e) => {
        resolve(e.target.result)
      }
      this.handlerRequest(request, hanlderResolve, reject)
    })
  }
  get (tableName, keyValue, indexCursor) {
    return this.getDB()
      .then(db => {
        return this.getValue(db, tableName, keyValue, indexCursor)
      })
  }
  getAll (tableName) { // 获取表中所有数据
    return this.getDB()
      .then(db => {
        return new Promise((resolve, reject) => {
          const request = db.transaction(tableName, 'readonly').objectStore(tableName).openCursor()
          const data = []
          const hanlderResolve = (e) => {
            const cursor = e.target.result
            if (cursor) {
              data.push(cursor.value)
              cursor.continue()
            } else {
              resolve(data)
            }
          }
          this.handlerRequest(request, hanlderResolve, reject)
        })
      })
  }
  update (tableName, data) { // 更新数据
    return this.getDB()
      .then(db => {
        return new Promise((resolve, reject) => {
          const request = db
            .transaction(tableName, 'readwrite')
            .objectStore(tableName)
            .put(data)
          this.handlerRequest(request, resolve, reject)
        })
      })
  }
  delete (tableName, primaryKey) { // 删除数据
    return this.getDB()
      .then(db => {
        return new Promise((resolve, reject) => {
          const request = db
            .transaction(tableName, 'readwrite')
            .objectStore(tableName)
            .delete(primaryKey)
          this.handlerRequest(request, resolve, reject)
        })
      })
  }
  handlerRequest (request, resolve, reject, resolveData) { // 处理结构
    request.onerror = function (e) {
      reject(e)
    }
    request.onsuccess = function (res) {
      let data = res
      if (resolveData && typeof resolveData === 'function') {
        data = resolveData(data)
      }
      resolve(data)
    }
  }
  add (tableName, data) { // 添加一条数据
    return this.getDB()
      .then(db => {
        return new Promise((resolve, reject) => {
          const request = db
            .transaction(tableName, 'readwrite')
            .objectStore(tableName)
            .add(data)
          this.handlerRequest(request, resolve, reject)
        })
      })
  }
  save (tableName, primaryKey, data) { // 保存数据没有就创建 有就更新
    return this.get(tableName, primaryKey).then(res => {
      const resData = res
      if (resData) {
        return this.update(tableName, data)
      } else {
        return this.add(tableName, data)
      }
    })
  }
  clear (tableName) { // 清空表
    return this.getDB()
      .then(db => {
        return db.transaction(tableName, 'readwrite').objectStore(tableName).clear()
      })
  }
  clearAll () { // 清空所有表
    const promises = []
    for (const k in this.store) {
      const item = this.store[k]
      promises.push(this.clear(item.name))
    }
    return promises
  }
  objectStoreNames () { // 获取所有表名
    return this.getDB()
      .then(db => {
        return db.objectStoreNames
      })
  }
}

export default IDB
