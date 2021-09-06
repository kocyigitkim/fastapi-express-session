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
        var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        var userAgent = req.headers['user-agent'];
        var isNewSession = false;
        var isGranted = true;
        if (sessionId) {
            try {
                _self.store.touch(sessionId, req.session);
            } catch (err) { console.error(err); }
            var result = await waitCallback(_self.store, _self.store.get, sessionId);
            if (!result) {
                isNewSession = true;
                result = { session: {}, ip: ip, userAgent: userAgent };
            }
            req.session = result.session || {};
            if (result && (result.ip != ip || result.userAgent != userAgent)) {
                isGranted = false;
                req.session = {};
                req.sessionId = uuid();
                req.userAgent = userAgent;
                sessionId = req.sessionId;
            }
        }
        else {
            sessionId = uuid();
            res.setHeader("sessionid", sessionId);
            var result = await waitCallback(_self.store, _self.store.set, sessionId, {});
            req.session = {};
            isNewSession = true;
        }
        res.on('finish', () => {
            if (!req.session && req.sessionId) {
                waitCallback(_self.store, _self.store.destroy, sessionId);
            }
            else {
                waitCallback(_self.store, _self.store.set, sessionId, { session: req.session, ip: ip, userAgent: userAgent });
            }
        });
        req.sessionManager = _self;
        req.sessionId = sessionId;
        next();
    }
}

module.exports = SessionManager;