module.exports = (attributes,knex)=>{

// get attribute list

attributes.get('/attributes',(req, res)=>{
    knex.select('*').from('attribute').then((data)=>{
        res.send(data);
    }).catch((err)=>{
        res.send(err);
        console.log(err);
    })
})

// get attribute list by attribute_id

attributes.get('/attributes/:attribute_id',(req, res)=>{
    let attribute_ID = req.params.attribute_id;
    knex
    .select('*')
    .from('attribute')
    .where('attribute_id',attribute_ID)
    .then((data)=>{
        res.send(data);
    }).catch((err)=>{
        res.send(err);
        console.log(err)
    })
})

// get attribute value by attribute_id

attributes.get('/attributes/value/:attribute_id',(req, res)=>{
    let attribute_value_ID = req.params.attribute_id;
    knex
    .select(
        'attribute_value_id',
        'value'
    )
    .from('attribute_value')
    .where('attribute_value_id',attribute_value_ID)
    .then((data)=>{
        res.send(data);
    })
    .catch((err)=>{
        console.log(err);
        res.send(err)
    })
})

// get all attributea with produt id

attributes.get('/attributes/inprodut/:product_id',(req,res)=>{
    let attribut_product_id = req.params.product_id;
    knex
    .select(
        '*'

    )
    .from('attribute')
    .join('attribute_value',function(){
        this.on('attribute.attribute_id', 'attribute_value.attribute_id')
    }).join('product_attribute',function(){
        this.on('attribute_value.attribute_value_id','product_attribute.attribute_value_id')
    })
    .where('product_attribute.product_id',attribut_product_id)
    .then((data)=>{
        // res.send(data)
        let data_list = []
        for(i of data){
            let dict={
                'attribute_name':i.name,
                "attribute_value_id":i.attribute_value_id,
                "attribute_value":i.value
            }
            data_list.push(dict)
        }
        res.send(data_list)
    }).catch((err)=>{
        res.send(err)
        console.log(err)
    })
})

}
