module.exports = (Shoppingcart,knex)=>{

    // to generate a unique cart_id
    Shoppingcart.get('/generateUniqueId', (req, res) => {
        var text = "",
            charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
        for (var i = 0; i < 18; i++) {
            text += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        console.log('your cart_id has been sent!');
        res.send({ cart_id: text });
    })

    // Add a Product in the cart
    Shoppingcart.post('/shoppingcart/add',(req, res)=>{
        let {body} = req;
        function user_query(){
            knex
                .select(
                    'item_id',
                    'name',
                    'attributes',
                    'shopping_cart.product_id',
                    'price',
                    'quantity',
                    'image'
                )
                .from('shopping_cart')
                .join('product',function(){
                    this.on('shopping_cart.product_id','product.product_id')
                })
                .where('shopping_cart.cart_id', body.cart_id)
                .then((data)=>{
                    data[0]['subtotal']= data[0].price * data[0].quantity
                    res.send(data)
                    console.log(data)
                })
                .catch((err) => console.log(err))

        }

        knex
            .select('*')
            .from('shopping_cart')
            .where('shopping_cart.cart_id', body.cart_id)
            .andWhere('shopping_cart.product_id', body.product_id)
            .andWhere('shopping_cart.attributes', body.attributes)
            .then((data)=>{
                if (data.length == 0){
                    knex('shopping_cart')
                    .insert({
                        'cart_id': body.cart_id,
                        'product_id': body.product_id,
                        'attributes': body.attributes,
                        'quantity': 1,
                        'added_on': new Date() 
                    })
                    .then(()=>{
                       user_query()  // to show all the data of the user
                    })
                    .catch((err) => console.log(err))
                }else{
                    quantity = data[0].quantity + 1
                    // console.log(quantity)
                    knex('shopping_cart')
                    .update({
                        'quantity': quantity,
                        'added_on': new Date()
                    })
                    .where('shopping_cart.cart_id', body.cart_id)
                    .andWhere('shopping_cart.product_id', body.product_id)
                    .andWhere('shopping_cart.attributes', body.attributes)
                    .then(() => {
                        user_query()  // to show all the data of the user
                    })
                    .catch((err) => console.log(err))

                }
            })
    })

    // Get List of Products in Shopping Cart

    Shoppingcart.get("/shopping/:cart_id",(req, res)=>{
        user_choice = req.params.cart_id;
        knex
        .select(
            'item_id',
            'name',
            'attributes',
            'shopping_cart.product_id',
            'price',
            'quantity',
            'image'
        )
        .from('shopping_cart')
        .join('product',function(){
            this.on('shopping_cart.product_id', 'product.product_id')
        })
        .where('shopping_cart.cart_id',user_choice)
        .then((data)=>{
            data[0]['subtotal']= data[0].price * data[0].quantity
            res.send(data)
            console.log(data)
        })
        .catch((err)=> res.send(err))   
    })

    // update the cart by item_id (quantity)

    Shoppingcart.put("/update/:item_id",(req, res)=>{

        knex('shopping_cart')
            .update({
                "quantity": req.body.quantity,
                "added_on": new Date()
            })
            .where('shopping_cart.item_id', req.params.item_id)
            .then(()=>{
                knex
                    .select('cart_id')
                    .from('shopping_cart')
                    .where("shopping_cart.item_id",req.params.item_id)
                    .then((Information)=>{
                        // res.send(Information)
                        knex
                        .select(
                            'item_id',
                            'name',
                            'attributes',
                            'shopping_cart.product_id',
                            'price',
                            'quantity'
                        )
                        .from('shopping_cart')
                        .join('product', function(){
                            this.on('shopping_cart.product_id', 'product.product_id')
                        })
                        .where('shopping_cart.cart_id',Information[0].cart_id)
                        .then((data)=>{
                            data[0]['subtotal']= data[0].price * data[0].quantity
                            res.send(data)
                        })
                        .catch((err)=>{
                            console.log({'Error':err.message})
                            res.send(err.message)
                        })
                    })
                    .catch((err)=>{
                        console.log(err)
                    })
            })
    })

    // Empty cart 
    Shoppingcart.delete('/empty/:cart_id',(req, res)=>{

        knex('shopping_cart')
        .where('shopping_cart.cart_id', req.params.cart_id)
        .del()
        .then(() => {
            return res.json({ deldata: 'data deleted successfully!' });
        })
        .catch((err) => {
            console.log(err);
            return res.json(error.error500);
        })
    })

    // return a total Amount from Cart

    Shoppingcart.get("/totalamount/:cart_id",(req, res)=>{
        knex
            .select('price','quantity')
            .from('shopping_cart')
            .join('product', function() {
                this.on('shopping_cart.product_id', 'product.product_id')
            })
            .where('shopping_cart.cart_id', req.params.cart_id)
            .then((data)=>{
                data[0]['subtotal']= data[0].price * data[0].quantity
                res.send(data)
            })
            .catch((err)=> console.log(err))
    })

    // making a new table for saving products for later 

    Shoppingcart.get('/saveforlater/:item_id',(req, res)=>{
        let user_choice = req.params.item_id;

        knex.schema.hasTable('save_product_later')
            .then((exists)=>{
                if (!exists){
                    return knex.schema.createTable('save_product_later',function(table){
                        table.integer('item_id').primary();
                        table.string('cart_id');
                        table.integer('product_id');
                        table.string('attributes');
                        table.string('quantity');
                        table.string('added_on');

                        knex
                            .select(
                                'item_id',
                                'cart_id',
                                'product_id',
                                'attributes',
                                'quantity'
                            )
                            .from('shopping_cart')
                            .where('shopping_cart.item_id', user_choice)
                            .then((data)=>{
                                data[0]['added_on'] = new Date()
                                knex('save_product_later')
                                    .insert(data[0])
                                    .then(()=>{
                                        knex('shopping_cart')
                                        .where('shopping_cart.item_id', user_choice)
                                        .del()
                                        .then(()=>{
                                            console.log('your product has been saved for later!');
                                            res.send('your product has been saved for later!')
                                        })
                                    })
                                    .catch((err)=> console.log(err))
                            })
                            .catch((err)=> console.log(err))
                    })
                }else{
                    knex
                    .select(
                        'item_id',
                        'cart_id',
                        'product_id',
                        'attributes',
                        'quantity'
                    )
                    .from('shopping_cart')
                    .where('shopping_cart.item_id', user_choice)
                    .then((data)=>{
                        data[0]['added_on'] = new Date()
                        knex('save_product_later')
                            .insert(data[0])
                            .then(()=>{
                                knex('shopping_cart')
                                .where('shopping_cart.item_id', user_choice)
                                .del()
                                .then(()=>{
                                    console.log('your product has been saved for later!');
                                    res.send('your product has been saved for later!')
                                })
                            })
                            .catch((err)=> console.log(err))
                    })
                    .catch((err)=> console.log(err))
                }
            })
    })

    // get products saved for later

    Shoppingcart.get('/product_saved/:cart_id',(req, res)=>{
        let cart_id = req.params.cart_id;
        knex
            .select(
                'item_id',
                'name',
                'attributes',
                'price'
            )
            .from('save_product_later')
            .join('product', function(){
                this.on('save_product_later.product_id', 'product.product_id')
            })
            .where('save_product_later.cart_id', cart_id)
            .then((data)=>{
                res.send(data)
            })
            .catch((err)=> console.log(err))

    })

    // move a product to cart

    Shoppingcart.get('/movetocart/:item_id',(req, res)=>{
        let item_id = req.params.item_id;
        knex('save_product_later')
        .where('save_product_later.item_id',item_id)
        .then((data)=>{
            data[0].added_on = new Date();
            knex('shopping_cart')
            .insert(data[0])
            .then(()=>{
                knex('save_product_later')
                .where('save_product_later.item_id', item_id)
                .del()
                .then(() => {
                    console.log('data moved to cart!');
                    res.send('data moved to cart!')
                })
                .catch((err) => {
                    console.log(err);
                })
            })
            .catch((err) => {
                console.log(err);
            })
        })
        .catch((err) => {
            console.log(err);
        })

    })

    // to remove a product from the card using item_id

    Shoppingcart.delete('/removeproduct/:item_id', (req, res) => {
        let item_id = req.params.item_id;

        knex('shopping_cart')
            .where('shopping_cart.item_id', item_id)
            .del()
            .then(() => {
                console.log('data deleted from cart using item_id!');
                return res.send('product removed by item_id!');
            })
            .catch((err) => {
                console.log(err);
            })
    })
}