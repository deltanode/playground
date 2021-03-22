const userCollection = require("../db").db().collection("users")
const followCollection = require("../db").db().collection("follow")
const ObjectID = require("mongodb").ObjectID

let Follow = function(followedUsername, authorId){
    this.followedUsername = followedUsername
    this.authorId = authorId
    this.errors = []
}

Follow.prototype.cleanUp = function(){
    if(typeof(this.followedUsername)!= "string"){
        this.followedUsername = ""
    }
}

Follow.prototype.validate = async function(action){
    //followed username must exist in database
    let followedAccount = await userCollection.findOne({username: this.followedUsername})
    if(followedAccount){
        this.followedId = followedAccount._id 
    }else{
        this.errors.push("You cannot follow a user that does not exist.")
    }

    let doesFollowAlreadyExist = await followCollection.findOne({ followedId: this.followedId, authorId: new ObjectID(this.authorId) })
    if(action == "create"){
        if(doesFollowAlreadyExist){ this.errors.push("You are already following a user")}
    }
    if(action == "delete"){
        if(!doesFollowAlreadyExist){ this.errors.push("You can not stop following someone you do not actually follow.")}
    }
    //should not be able to follow yourself
    if(this.followedId.equals(this.authorId)){
        this.errors.push("You cannot follow yourself")
    }
}

Follow.prototype.create = function(){
    return new Promise(async (resolve, reject)=>{
        this.cleanUp()
        await this.validate("create")
        if(!this.errors.length){
            followCollection.insertOne({followedId: this.followedId,authorId: new ObjectID(this.authorId) })
            resolve()
        }else{
            reject(this.errors)
        }
    })
}

Follow.prototype.delete = function(){
    return new Promise(async (resolve, reject)=>{
        this.cleanUp()
        await this.validate("delete")
        if(!this.errors.length){
            followCollection.deleteOne({followedId: this.followedId, authorId: new ObjectID(this.authorId) })
            resolve()
        }else{
            reject(this.errors)
        }
    })
}

Follow.isVisitorFollowing = async function(followedId, visitorId){
    let followDoc = await followCollection.findOne({followedId: followedId, authorId: new ObjectID(visitorId)})
    if (followDoc){
        return true
    }else{
        return false
    }
}

module.exports = Follow