const InMemorySessionStore = require("./InMemorySessionStore");
const uuid = require('uuid').v4;
const { waitCallback } = require('../utils');

class SessionManager {
    constructor(store) {
        if (!store) store = new InMemorySessionStore();
        this.store = store;
        this.use = this.use.bind(this);
    }

    async use(req, res, next) {
        const _self = this;
        var sessionId = req.header("sessionid");
        if (sessionId) {
            try {
                _self.store.touch(sessionId, req.session);
            } catch (err) { console.error(err); }
            var result = await waitCallback(_self.store, _self.store.get, sessionId);
            req.session = result || {};
        }
        else {
            sessionId = uuid();
            res.setHeader("sessionid", sessionId);
            var result = await waitCallback(_self.store, _self.store.set, sessionId, {});
            req.session = {};
        }
        res.on('finish', () => {
            if (!req.session && req.sessionId) {
                waitCallback(_self.store, _self.store.destroy, sessionId);
            }
            else {
                waitCallback(_self.store, _self.store.set, sessionId, req.session);
            }
        });
        req.sessionManager = _self;
        req.sessionId = sessionId;
        next();
    }
}

module.exports = SessionManager;