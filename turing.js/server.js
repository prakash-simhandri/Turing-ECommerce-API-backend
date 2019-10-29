const express = require('express');
const app = express();
app.use(express.json());
const jwt = require('jsonwebtoken');
const Env = require('dotenv').config()

// token private Key

const Secretkey_Key = process.env.Private_Key


const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : process.env.S_host,
      user : process.env.S_UserName,
      password : process.env.S_Password,
      database : process.env.S_Database
    }
});

// get attributes data

var attributes = express.Router();
app.use("/", attributes);
require("./attributes")(attributes,knex);

// get products data

var products = express.Router();
app.use("/", products);
require("./products")(products,knex,jwt,Secretkey_Key)

// get departments data
var department = express.Router();
app.use("/", department);
require("./departments")(department,knex);  

// get categories
var category = express.Router();
app.use("/", category);
require("./categories")(category,knex);

//  get customers

var Customer = express.Router();
app.use("/" ,Customer);
require("./customers")(Customer,jwt,knex,Secretkey_Key);

var Oders = express.Router();
app.use("/",Oders);
require("./oders")(Oders,jwt,knex,Secretkey_Key)

var Shoppingcart = express.Router();
app.use("/", Shoppingcart);
require("./shoppingcart")(Shoppingcart,knex);

var Tax = express.Router();
app.use("/", Tax);
require("./tax")(Tax,knex)

var Shipping = express.Router();
app.use("/",Shipping);
require("./shipping")(Shipping,knex)

app.listen(process.env.A_Port)
console.log('success......')