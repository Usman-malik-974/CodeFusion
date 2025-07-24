const mongoose=require('mongoose');

exports.conn=()=>{
    mongoose.connect(process.env.MONGO_DB_URL)
    .then(()=>{console.log("Connected successfully to mongoDB");})
    .catch((e)=>{console.log("Error: "+e)});
}