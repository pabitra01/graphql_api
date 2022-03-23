const jwt=require('jsonwebtoken');
const createToken=userID=>{
    return jwt.sign({userID},process.env.TOKEN_SECRET,{
        expiresIn:'300s'
    })
}
module.exports={createToken}