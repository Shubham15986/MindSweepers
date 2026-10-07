import mongoose from "mongoose";
const uri = "mongodb://recursionnit_db_user:6dYZGNCQk3n0zLRz@ac-rq0eldy-shard-00-00.5j1iwhu.mongodb.net:27017,ac-rq0eldy-shard-00-01.5j1iwhu.mongodb.net:27017,ac-rq0eldy-shard-00-02.5j1iwhu.mongodb.net:27017/mindsweepers?ssl=true&replicaSet=atlas-pvhjyz-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(uri)
  .then(() => { console.log("Success!"); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
