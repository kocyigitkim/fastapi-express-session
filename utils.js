module.exports.waitCallback = async function(_this, action, ...args){
    return new Promise((resolve,reject)=>{
        action.call(_this, ...args, (err, result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    }).catch(console.error);
}