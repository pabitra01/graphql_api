const { mapSchema, getDirective, MapperKind } = require('@graphql-tools/utils');
const jwt=require('jsonwebtoken');
const { defaultFieldResolver } = require('graphql');
function upperDirectiveTransformer(schema,directiveName){
  return mapSchema(schema,{
    [MapperKind.OBJECT_FIELD]:(fieldConfig)=>{
      const upperDirective=getDirective(schema,fieldConfig,directiveName)?.[0];
      if(upperDirective){
        const{resolve=defaultFieldResolver}=fieldConfig;
        fieldConfig.resolve=async function(source,args,context,info){
          const result=await resolve(source,args,context,info);
          if (typeof result === 'string') {
            return result.toUpperCase();
          }
          return result;
        }
        return fieldConfig;
      }
    }
  })
}
function isLoggedinDirectiveTransformer(schema,directiveName){
  return mapSchema(schema,{
    [MapperKind.OBJECT_FIELD]:(fieldConfig)=>{
      const isLoggedinDirective=getDirective(schema,fieldConfig,directiveName)?.[0];
      if(isLoggedinDirective){
        const{resolve=defaultFieldResolver}=fieldConfig;
        fieldConfig.resolve=async function(source,args,context,info){
          const result=await resolve(source,args,context,info);
          if(!context.user){
            console.log("you are not authorized");
            return null;
          }
          else if(context.user){
            const token=context.user
            const isVerified=jwt.verify(token,process.env.TOKEN_SECRET,(err,user)=>{
              if(err){
                console.log(err.message);
                return false;
              }
              return true;
            })
            if(isVerified){
              return result
            }
          }
        }
        return fieldConfig;
      }
    }
  })
}
module.exports={upperDirectiveTransformer,isLoggedinDirectiveTransformer}