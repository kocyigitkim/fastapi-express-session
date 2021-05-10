const ISessionStore = require("./ISessionStore");
const connectRedis = require('connect-redis');
const redis = require('redis');
const noop = () => { };
var redisStore = connectRedis({ Store: ISessionStore });

class RedisSessionStore extends ISessionStore {
    constructor(config) {
        super();
        this.config = config;
        this.init = this.init.bind(this);
        var store = new redisStore({ client: redis.createClient(config) });
        this.store = store;
    }
}

module.exports = RedisSessionStore;