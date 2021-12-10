const InMemorySessionStore = require("./InMemorySessionStore");
const uuid = require('uuid').v4;
const { waitCallback } = require('../utils');
const requestIp = require('request-ip');
class SessionManager {
    constructor(store) {
        if (!store) store = new InMemorySessionStore();
        this.store = store;
        this.use = this.use.bind(this);
    }

    async use(req, res, next) {
        const _self = this;
        var sessionId = req.header("sessionid");
        var ip = req.ip;
        var isV6 = req.socket.remoteFamily === 'IPv6';

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
                result = { session: {}, ip: !isV6 ? ip : null, ipv6: isV6 ? ip : null, userAgent: userAgent };
            }
            if (isV6 && !result.ipv6) {
                result.ipv6 = ip;
            }
            result.userAgent = userAgent;

            req.session = result.session || {};
            if (result && ((isV6 ? (result.ipv6 != ip) : (result.ip != ip)) || result.userAgent != userAgent)) {
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
            if ((!req.session || Object.keys(req.session).length == 0) && req.sessionId) {
                waitCallback(_self.store, _self.store.destroy, sessionId);
            }
            else {
                waitCallback(_self.store, _self.store.set, sessionId, result);
            }
        });
        req.sessionManager = _self;
        req.sessionId = sessionId;
        next();
    }
}

module.exports = SessionManager;