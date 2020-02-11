module.exports = (Tax,knex)=>{

    // get all taxes

    Tax.get('/getalltax',(req, res)=>{
        knex
        .select("*")
        .from('tax')
        .then((data)=>{
            res.send(data);
        })
        .catch((err)=>{
            console.log(err);
        })
    })

    // get tax by id

    Tax.get("/tax/:tax_id",(req, res)=>{
        let user_tax_id = req.params.tax_id;
        knex
            .select('*')
            .from('tax')
            .where('tax.tax_id',user_tax_id)
            .then((data)=>{
                res.send(data);
            })
            .catch((err)=> console.log(err))
    })
}