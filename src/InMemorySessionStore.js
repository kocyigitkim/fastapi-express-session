const ISessionStore = require("./ISessionStore");

class InMemorySessionStore extends ISessionStore {
  /**
   * @param {Object} config
   * @param {Number} config.ttl
   */
  constructor(config) {
    super();
    this.config = { ttl: 1000 * 30 * 60, ...config };
    this.store = {};
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.destroy = this.destroy.bind(this);
    this.worker = this.worker.call(this);
    this.targetTTL = this.config.ttl;
  }
  async worker() {
    const _self = this;
    while (true) {
      var now = new Date();
      for (var k in this.store) {
        var v = this.store[k];
        if (!v.ttl | v.ttl < now) {
          delete this.store[k];
        }
      }
      await new Promise((resolve) => {
        setTimeout(resolve, _self.targetTTL);
      });
    }
  }
  get(id, callback) {
    var v = this.store[id];
    if (v && v.value) {
      callback(null, v.value);
    }
    else {
      callback("Session not exists", v);
    }
  }
  set(id, value, callback) {
    this.store[id] = { value: value, ttl: new Date(new Date().valueOf() + this.targetTTL + 1000) };
    callback(null, this);
  }
  destroy(id, callback) {
    var v = this.store[id];
    if (v && v.value) {
      delete this.store[id];
      callback(null, v.value);
    }
    else {
      callback("Session not exists", v);
    }
  }
}

module.exports = InMemorySessionStore;