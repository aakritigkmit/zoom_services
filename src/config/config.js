const dotenv=require('dotenv');
dotenv.config();

module.exports=
{
  "development": {
    "username": process.env.USERNAME,
    "password": process.env.PASSWORD,
    "database": process.env.DATABASE,
    "host": process.env.HOST,
    "dialect": "postgres"
  }
  ,
  "test": {
   "username": process.env.USERNAME,
    "password": process.env.PASSWORD,
    "database": process.env.DATABASE,
    "host": process.env.HOST,
    "dialect": "postgres"
  }
  
}
