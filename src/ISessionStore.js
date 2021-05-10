const noop = () => {};

class ISessionStore{
    constructor(){
    }
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