var EventEmitter = require('events').EventEmitter;
const noop = () => {};

class ISessionStore{
    constructor(){
        EventEmitter.call(this);
    }
    init(manager, cb = noop){}
    get(sid, cb = noop){}
    set(sid, sess, cb = noop){}
    touch(sid, sess, cb = noop){}
    destroy(sid, cb = noop){}
    clear(cb = noop){}
    length(cb = noop){}
    ids(cb = noop){}
    all(cb = noop){}
    _getTTL(sess){}
    _getAllKeys(cb = noop){}
    _scanKeys(cb = noop){}
}

module.exports = ISessionStore;