const Middleware = {};
Middleware.sessionData = async(req,res)=>{
    try{
        console.log(res.locals,'res.locals')
      const currentUserSession = res.locals.shopify.session;
      console.log(currentUserSession,'current user session 1234')
      res.status(200).json({
        status : 200,
        data : currentUserSession
    })
    } catch(error){
        res.status(500).json({
            status : 500,
            message : error.message
        })
    }
}
export default Middleware;