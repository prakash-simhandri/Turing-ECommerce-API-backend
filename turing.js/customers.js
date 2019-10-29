    module.exports = (Customer,jwt,knex,Secretkey_Key) =>{
        // // (post)resister a customer
        // user first fall sign uping

    Customer.post("/customer/signup", (req, res) =>{
        // console.log(req.body);
        var email = req.body.email;
        // console.log(email);
        var accessToken = jwt.sign(req.body, Secretkey_Key,{expiresIn: "24h"}, )
        // console.log(accessToken);
        knex
        .select('*')
        .from('customer')
        .where('customer.email', email)
        .then((data) =>{
            // console.log(data);
            if (data.length<1){
                knex('customer').insert(req.body)
                .then((result) =>{
                    knex
                    .select('*')
                    .from('customer')
                    .where('email',email)
                    .then((user) =>{
                        // console.log(user);
                        userdata = {'customer': {'schema': user[0]}, accessToken, expires_in: '24h'}
                        res.cookie(accessToken)
                        res.send(userdata);
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                }).catch((err) =>{
                    console.log(err);
                })
            }else{
                res.send({"Error":"this user already exist..."})
            }
        })
    })

    // user login

    Customer.post("/customer/login",(req, res)=>{
        // console.log(req.body)
        knex.select("*")
        .from("customer")
        .where("email",req.body.email)
        .then((data)=>{
            if (data.length>0){
                if (data[0].password === req.body.password){
                    var Token = jwt.sign({"customer_id":data[0].customer_id,"name":data[0].name,"role": "customer"}, Secretkey_Key, {expiresIn:'24h'})
                    res.cookie(Token)
                    delete data[0].password;
                    res.send({
                        "customer": {
                        "schema": {data},
                        "accessToken": "hello AbC"+Token+"hi",
                        "expires_in": "24h"
                        }
                    })
                }else{
                    res.send({
                        "error": {
                          "status": 400,
                          "code": "USR_01",
                          "message": "Email or Password is invalid.",
                          "field": "password"
                        }
                      })
                }
            }else{
                res.send( {"Error":"This user dosent exists..."})
            }
        })
    })

    Customer.put("/customer/updates",(req, res)=>{
        let geting = req.headers.cookie
        if (geting != undefined){
            geting=geting.split(" ")
            geting=geting[geting.length-1]
            geting=geting.slice(0,-10)
            // console.log(geting)
            jwt.verify(geting,Secretkey_Key,(err, data)=>{
                if (!err) {
                    let token_data = req.body
                    console.log(token_data)
                    var user_data_customer_id = data.customer_id
                    console.log(user_data_customer_id)
                    knex("customer")
                    .where("customer_id",user_data_customer_id)
                    .update({
                        'name': token_data.name,
                        'email': token_data.email,
                        'password': token_data.password,
                        'day_phone': token_data.day_phone,
                        'eve_phone': token_data.eve_phone,
                        'mob_phone': token_data.mob_phone
                    })
                    .then((data) =>{
                        res.send("Put data updated successfully")
                    }).catch((err) =>{
                        res.send(err.message)
                    })
                }else{
                    res.send({"Error":"Something Token verify problem"})
                }
                
            })
        }else{
            res.send({"Error":{
                "login":"plesse first login then update..."
            }})
        }
    })

    Customer.put("/customer/address",(req, res)=>{
        let cookie_data = req.headers.cookie
        if (cookie_data != undefined){
            cookie_data = cookie_data.split(" ")
            cookie_data = cookie_data[cookie_data.length-1]
            cookie_data = cookie_data.slice(0,-10)
            // res.send(cookie_data)
            jwt.verify(cookie_data,Secretkey_Key,(err,data)=>{
                if (!err) {
                    knex('customer')
                    .where('customer_id', data.customer_id)
                    .update({
                        'address_1': req.body.address_1,
                        'address_2': req.body.address_2,
                        'city': req.body.city,
                        'region': req.body.region,
                        'postal_code': req.body.postal_code,
                        'country': req.body.country,
                        'shipping_region_id': req.body.shipping_region_id
                    })
                    .then((data) =>{
                        res.send("address data updated successfully.")
                    }).catch((err) =>{
                        console.log(err);
                        res.send({"Msg": "err check your data in you database."})
                    })
                }else{
                    res.send({"Error":err.message})
                }
            })
        }else{
            res.send({"Error":{
                "login":"plesse first login then update..."
            }})
        }
    })

    Customer.put("/customer/creditcart",(req,res)=>{
        let cookie_data = req.headers.cookie
        if (cookie_data != undefined){
            cookie_data = cookie_data.split(" ")
            cookie_data = cookie_data[cookie_data.length-1]
            cookie_data = cookie_data.slice(0,-10)
            jwt.verify(cookie_data,Secretkey_Key,(err, data)=>{
                if(!err){
                    knex('customer')
                    .where('customer_id', data.customer_id)
                    .update({'credit_card':req.body.credit_card})
                    .then((data) =>{
                        res.send("credit_card data updated successfully")
                    }).catch((err) =>{
                        res.send({"Msg": "err check your data in your database."})
                    })
                }else{
                    res.send({"Error":err.message})
                }
            })
        }else{
            res.send({"Error":{
                "login":"plesse first login then update..."
            }})
        }
    })
}