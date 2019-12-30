//prettier-ignore
if(process.env.NODE_ENV == 'production'){
    //we are in production - return the prod set of keys
    module.exports = require("./prod");
} else {
    // we are in development - return the dev key 
    module.exports = require("./dev");
}
