module.exports = (Shipping,knex)=>{
    // Return shippings regions

    Shipping.get('/shipping/regions',(req, res)=>{
        knex
        .select('*')
        .from('shipping_region')    
        .then((data)=>{
            res.send(data)
        })
        .catch((err)=> res.send(err.message))
    })

    // Return shippings regions

    Shipping.get('/region/:shippings_region_id',(req, res)=>{
        let user_choice = req.params.shippings_region_id;

        knex
            .select(
                "shipping_id",
                "shipping_type",
                "shipping_cost",
                "shipping_region.shipping_region_id"
            )
            .from('shipping_region')
            .join('shipping',function(){
                this.on('shipping_region.shipping_region_id', 'shipping.shipping_region_id')
            })
            .where('shipping_region.shipping_region_id',user_choice)
            .then((data)=>{
                res.send(data)
            })
            .catch((err)=> console.log(err))
    })
}