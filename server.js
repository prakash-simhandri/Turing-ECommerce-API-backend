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
require("./routes/attributes")(attributes,knex);

// get products data

var products = express.Router();
app.use("/", products);
require("./routes/products")(products,knex,jwt,Secretkey_Key)

// get departments data
var department = express.Router();
app.use("/", department);
require("./routes/departments")(department,knex);  

// get categories
var category = express.Router();
app.use("/", category);
require("./routes/categories")(category,knex);

//  get customers

var Customer = express.Router();
app.use("/" ,Customer);
require("./routes/customers")(Customer,jwt,knex,Secretkey_Key);

// get Oders data

var Oders = express.Router();
app.use("/",Oders);
require("./routes/oders")(Oders,jwt,knex,Secretkey_Key)

// get Shoppingcart data

var Shoppingcart = express.Router();
app.use("/", Shoppingcart);
require("./routes/shoppingcart")(Shoppingcart,knex);

// get Tax data

var Tax = express.Router();
app.use("/", Tax);
require("./routes/tax")(Tax,knex)

// get shipping data

var Shipping = express.Router();
app.use("/",Shipping);
require("./routes/shipping")(Shipping,knex)

app.listen(process.env.A_Port)
console.log('success......')