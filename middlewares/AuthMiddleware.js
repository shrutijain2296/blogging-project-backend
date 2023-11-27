const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
    const token = req.headers["x-acciojob"];

    // veryfy jwt token
    let verified;

    try{
        verified = jwt.verify(token, process.env.JWT_SECRET);
    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "JWT not provided. Please login",
            data: err,
        });
    }

    if(verified){
        // localstorage of express
        req.locals = verified;
        next();
    }else{
        return res.status(401).send({
            status: 401,
            message: "User not authenticated. Please login",
            data: err,
        });
    }
}

module.exports = { isAuth };