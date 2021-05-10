const InMemorySessionStore = require("./InMemorySessionStore");

class SessionManager {
    constructor(store) {
        if (!store) store = new InMemorySessionStore();
        this.store = store;
    }

    async use(req, res, next) {
        if(req.headers && req.headers.sessionId){
            
        }
    }
}

module.exports = SessionManager;