const Middleware = {};

Middleware.sessionData = async(req,res)=>{
    try{
      const currentUserSession = res.locals.shopify.session;

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