const mongoose = require('mongoose');
const redis= require('redis');
const util = require('util');
const keys = require('../config/keys')

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

//console.log('Outside the mongoose query and insite the cache file', this);
mongoose.Query.prototype.cache = function(options = {}){
    this.useCache = true;
    this.hashKey=JSON.stringify(options.key || '');
    return this;
}

mongoose.Query.prototype.exec = async function(){
    if(!this.useCache){
        return exec.apply(this,arguments);
    }
    //create the key for redis
    const key = JSON.stringify(Object.assign({},this.getQuery(),{collection:this.mongooseCollection.name}));
    //see if value exists in a cache
    const cacheValue = await client.hget(this.hashKey,key);
    //if no then execute the query and get the result
    if(cacheValue){
        const doc = JSON.parse(cacheValue);
        //Return a mongoose compliant document for array or single object 
        return Array.isArray(doc)
                ? doc.map(d => new this.model(d))
                : new this.model(doc)
    }
    const result = await exec.apply(this,arguments);
    //Store the values in redis client
    client.hset(this.hashKey,key, JSON.stringify(result));
    //return the query result as a mongoose document returned from mongo db
    return result;
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
};