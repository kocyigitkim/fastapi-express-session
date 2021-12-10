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
        var ip = req.socket.remoteAddress;
        var isV6 = checkIfValidIPV6(ip);

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

function checkIfValidIPV6(str) {
    // Regular expression to check if string is a IPv6 address
    const regexExp = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/gi;

    return regexExp.test(str);
}


module.exports = SessionManager;