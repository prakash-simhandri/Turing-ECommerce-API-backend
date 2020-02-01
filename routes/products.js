module.exports = (products,knex,jwt,Secretkey_Key)=>{

    // Get All Products

    products.get('/products',(req, res)=>{
        knex
        .select('*').from('product').then((data)=>{
            res.send(data)
        }).catch((err)=>{
            console.log(err);
            res.send(err);
        })
    })

    // products search

    products.get('/products/search',(req,res)=>{
        knex
        .select(
            'product_id',
            'name',
            'description',
            'price',
            'discounted_price',
            'thumbnail'
        )
        .from('product').then((data)=>{
            res.send(data);
        }).catch((err)=>{
            console.log(err)
            res.send(err)
        })
    })

    // Product by ID

    products.get('/products/:product_id',(req, res)=>{
        let product_ID = req.params.product_id;
        knex
        .select('*').from('product').where('product_id',product_ID)
        .then((data)=>{
            res.send(data);
        }).catch((err)=>{
            console.log(err);
            res.send(err);
        })
    })

    // Get a lit of Products of Categories

    products.get('/products/incategory/:caregory_id',(req, res)=>{
        let product_caregory_ID = req.params.caregory_id;
        knex
        .select(
            'product.product_id',
            'name',
            'description',
            'price',
            'discounted_price',
            'thumbnail'
        )
        .from('product')
        .join('product_category',function(){
            this.on('product.product_id','product_category.product_id')
        })
        .where('product.product_id',product_caregory_ID)
        .then((data)=>{
            res.send(data)
        }).catch((err)=>{
            res.send(err)
            console.log(err)
        })
    })

    // Get a list of Products on Department

    products.get('/products/indepartment/:department_id',(req, res)=>{
        let product_department_ID = req.params.department_id;
        knex
        .select(
            'product.product_id',
            'product.name',
            'product.description',
            'product.price',
            'product.discounted_price',
            'product.thumbnail'
        )
        .from('product')
        .join('product_category',function(){
            this.on('product.product_id','product_category.product_id')
        }).join('category',function(){
            this.on('product_category.category_id','category.category_id')
        }).join('department',function(){
            this.on('category.department_id','department.department_id')
        })
        .where('department.department_id',product_department_ID)
        .then((data)=>{
            res.send(data)

        }).catch((err)=>{
            res.send(err)
            console.log(err)
        })
    })

    // Get details of a Product

    products.get("/products/:product_id/details",(req, res)=>{
        let product_details_ID = req.params.product_id;
        knex
        .select(
            'product_id',
            'name',
            'description',
            'price',
            'discounted_price',
            'image',
            'image_2'
        )
        .from('product')
        .where('product.product_id',product_details_ID)
        .then((data)=>{
            res.send(data)
        })
        .catch((err)=>{
            res.send(err)
            console.log(err)
        })
    })

    // Get locations of a Product

    products.get('/product/:product_id/locations',(req, res)=>{
        let product_locations_id = req.params.product_id;
        knex
        .select(
            'category.category_id',
            'category.name as category_name',
            'category.department_id',
            'department.name as department_name'
        )
        .from('product').join('product_category', function(){
            this.on('product.product_id','product_category.product_id')
        }).join('category',function(){
            this.on('product_category.category_id','category.category_id')
        }).join('department',function(){
            this.on('category.department_id','department.department_id')
        })
        .where('product.product_id',product_locations_id)
        .then((data)=>{
            res.send(data)
        }).catch((err)=>{
            res.send(err)
            console.log(err)
        })
    })

        // Post reviews of a Product

    products.post('/products/:product_id/reviews',(req,res)=>{
        let product_id = req.params.product_id;
        knex
        .select('name','product_id')
        .from('product')
        .where('product.product_id', product_id)
        .then((data)=>{
            // res.send(data[0])
            let accessToken = jwt.sign({"name":data[0].name,"product_id": data[0].product_id}, Secretkey_Key,{expiresIn: "24h"}, )
            res.cookie(accessToken)
            knex('review')
                .insert({
                    review: req.body.review,
                    rating: req.body.rating,
                    created_on: new Date(),
                    product_id: product_id,
                    customer_id: req.body.customer_id
                })
                .then((review_data)=>{
                    console.log('your review data insert successfully :)')
                    res.json({ response: 'review inserted!' });
                })
                .catch((err)=>{
                    console.log('sorry! your data is not inserted :(')
                    res.json(err);
                })
        })
        .catch((err)=>{
            res.send(err)
        })

    })

    // Get reviews of a Product 

    products.get('/products/:product_id/reviews',(req, res)=>{
        let product_id = req.params.product_id;
        knex
        .select('*')
        .from('review')
        .where('review.product_id', product_id)
        .then((data)=>{
            res.send(data)
        })
        .catch((err)=>{
            res.send(err)
        })
    })

}