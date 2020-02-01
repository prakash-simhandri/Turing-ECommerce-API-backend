
module.exports = (category,knex)=>{
category.get('/category',(req, res)=>{
    knex.select('*').from('category').then((data)=>{
        console.log(data);
        res.send(data)
    }).catch((err)=>{
        console.log(err)
        res.send(err)
    })
})
    
category.get('/category/:category_id',(req, res)=>{
    let Category_ID = req.params.category_id;
    knex.select('*').from('category').where('category_id',Category_ID).then((data)=>{
        res.send(data);
        console.log(data)
    }).catch((err)=>{
        res.send(err);
    })
})

category.get('/category/inProduct/:product_id',(req, res)=>{
    let product_id = req.params.product_id;
    knex
    .select(
        'category.category_id',
        'department_id',
        'name'
    )
    .from('category')
    .join('product_category', function(){
        this.on('category.category_id', 'product_category.category_id')
    })
    .where('product_category.product_id', product_id)
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})

// get category of a deoarmeint

category.get('/category/indeoarmeint/:department_id',(req, res)=>{
    var department_ID = req.params.department_id;
    knex .select('*').from('category').where('department_id',department_ID)
    .then((data)=>{
        res.send(data)
    }).catch((err)=>{
        console.log(err)
        res.send(err)
    })
})
}