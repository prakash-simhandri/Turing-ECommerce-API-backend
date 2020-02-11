module.exports = (Oders,jwt,knex,Secretkey_Key)=>{
    function token_checking(req, res, next){
        let token =  req.headers.cookie;
        if(token != undefined){
            token = token.split(" ")
            token = token[token.length-1]
            token = token.slice(0, -10)

            let u_token = jwt.verify(token,Secretkey_Key,(err,vrf_data)=>{
                if(!err){
                    knex
                    .select("*")
                    .from('customer')
                    .where('name',vrf_data.name)
                    .then((data)=>{
                        next()

                    }).catch((err)=>{
                        res.send({
                            "error": {
                                "status": 401,
                                "code": "AUT_02",
                                "message": "Access Unauthorized",
                                "field": "NoAuth"
                            }
                        })
                    })
                }else{
                    // console.log(err.message)
                    res.send({
                        "code": "USR_02",
                        "message": "jwt expired",
                        "field": "example",
                        "status": "500"
                      })
                }
            })
        }else{
            res.send({
                "code": "AUT_02",
                "message": "The apikey is invalid.",
                "field": "API-KEY"
              })
        }        
    }

    Oders.post("/orders",token_checking,(req,res)=>{
        let { body } = req;
        let { cart_id, shipping_id, tax_id } = body;
        
        // verifying jwt-token code...
        let user_token = req.headers.cookie;
        user_token = user_token.split(' ')
        user_token = user_token[user_token.length-1]
        user_token = user_token.slice(0, -10)

        jwt.verify(user_token,Secretkey_Key,(err,vrf_token)=>{
            if(!err){
                knex('customer')
                .where('customer.customer_id',vrf_token.customer_id)
                .then((customer_data)=>{
                    knex
                        .select("*")
                        .from("shopping_cart")
                        .where("cart_id",cart_id)
                        .join("product",function(){
                            this.on('shopping_cart.product_id','product.product_id')
                        }).then((shipping_data)=>{
                            total_Of_Cart = shipping_data.map(unitData => unitData.price * unitData.quantity).reduce((a, b) => a + b, 0)
                            // console.log(shipping_id,tax_id);
                            knex('orders')
                            .insert({
                                'total_amount': total_Of_Cart,
                                'created_on': new Date(),
                                'customer_id': customer_data[0].customer_id,
                                'shipping_id': shipping_id,
                                'tax_id': tax_id
                            }).then(( )=>{
                                knex('orders')
                                    .then((orders_data)=>{
                                        knex('order_detail')
                                        .insert({
                                            'order_id': orders_data[orders_data.length-1].order_id,
                                            'product_id': shipping_data[0].product_id,
                                            'attributes': shipping_data[0].attributes,
                                            'product_name': shipping_data[0].name,
                                            'quantity': shipping_data[0].quantity,
                                            'unit_cost': shipping_data[0].price
                                        }).then((details)=>{
                                            knex.select("*").from("shopping_cart").where("cart_id",cart_id).delete()
                                            .then(()=>{
                                                return res.json({order_id: orders_data[orders_data.length-1].order_id});
                                            }).catch(()=>{
                                                res.send({"error":"error in deleting data"})
                                            })
                                        }).catch((err)=>{
                                            res.send(err.message)
                                        })
                                    })
                                    .catch((err)=>{
                                        res.send(err.message)
                                    })
                            })
                            .catch((oders_err)=>{
                                res.send(oders_err.message)
                            })
                            
                        })
                        .catch((err)=>{
                            res.send(err)
                        })
                })
                .catch((err)=>{
                    res.send(err)
                })
            }else{
                res.send(
                    { "error_name": err.message,
                    "tokenExpiredAt": err.expiredAt }
                )
            }
        })
        
    })

    // get orders by customer

    Oders.get("/orders/inCustomer",token_checking,(req,res)=>{
        let user_token = req.headers.cookie;
        user_token = user_token.split(' ')
        user_token = user_token[user_token.length-1]
        user_token = user_token.slice(0, -10)

        jwt.verify(user_token, Secretkey_Key,(err,vrf_token)=>{
            if(!err){
                // res.send(vrf_token)
                knex
                .select('*')
                .from('orders')
                .where('customer_id', vrf_token.customer_id)
                .then((data) =>{
                    res.send(data);
                })
                .catch((err) =>{
                    console.log({"Error":err.message});
                })
            }else{
                res.send(
                    {
                    "Error":err.message
                    }
                )   
            }
        })
    })

    // get info about order by order_id

    Oders.get("/orders/:order_id",token_checking,(req,res)=>{
        let user_C_order_id = req.params.order_id;
        
        let user_token = req.headers.cookie;
        user_token = user_token.split(' ')
        user_token = user_token[user_token.length-1]
        user_token = user_token.slice(0, -10)

        jwt.verify(user_token,Secretkey_Key,(err,vrf_token)=>{
            if(!err){
                knex
                .select(
                    'order_id',
                    'product_id',
                    'attributes',
                    'product_name',
                    'quantity',
                    'unit_cost'
                )
                .from('order_detail')
                .where('order_detail.order_id', user_C_order_id)
                .then((data)=>{
                   data[0]["subtotal"]=data[0].quantity*data[0].unit_cost
                   res.send(data[0])
                   
                })
                .catch((err)=>{
                    res.send(err.message)
                })
            }else{
                res.send(
                    { "error_name": err.message,
                    "tokenExpiredAt": err.expiredAt }
                )
            }
        })
    })


    // Get Info about Order in short detail

    Oders.get("/oders/shortDetails/:order_id",token_checking,(req,res)=>{
        let user_C_order_id = req.params.order_id;
        
        let user_token = req.headers.cookie;
        user_token = user_token.split(' ')
        user_token = user_token[user_token.length-1]
        user_token = user_token.slice(0, -10)

        jwt.verify(user_token,Secretkey_Key,(err,vrf_token)=>{
            if(!err){
                knex
                    .select(
                        'orders.order_id',
                        'orders.total_amount',
                        'orders.created_on',
                        'orders.shipped_on',
                        'orders.status',
                        'order_detail.product_name as name'
                    )
                    .from('orders')
                    .join('order_detail', function() {
                        this.on('orders.order_id','order_detail.order_id')
                    })
                    .where('orders.order_id', user_C_order_id)
                    .then((data)=>{
                        res.send(data)
                    })
                    .catch((err)=>{
                        res.send(err.message)
                    })
            }else{
                res.send(
                    { "error_name": err.message,
                    "tokenExpiredAt": err.expiredAt }
                )
            }
        })
    })
}