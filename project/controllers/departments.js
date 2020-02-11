
module.exports = (department,knex)=>{
department.get('/department',(req, res)=>{
    knex.select('*').from('department').then((data)=>{
        console.log(data);
        res.send(data)
    }).catch((err)=>{
        console.log(err)
    })
})

department.get("/department/:department_id",(req, res)=>{
    let Department_ID = req.params.department_id;
    knex.select('*').from('department').where('department_id',Department_ID).then((data)=>{
        console.log(data);
        res.send(data);
    }).catch((err)=>{
        console.log(err);
    })
})
}