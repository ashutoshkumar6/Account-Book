const express=require('express')
const tasks=require('../models/tasks')
const auth=require('../middleware/auth')
const router=new express.Router()

//creating new task
router.post('/tasks',auth,async (req,res)=>{
   // const task=new tasks(req.body)
   const task=new tasks({
       ...req.body,//copy all the contents of req.body to this object
       owner:req.user._id
   })
   try{
       await task.save()
       res.status(201).send(task) 
   }catch(e){
       res.status(404).send(e)
   }
})

//fetching all the tasks
//GET /tasks?completed=true
//GET /tasks?limit=2&skip=2
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks',auth,async (req,res)=>{
  const match={}
  const sort={}
  if(req.query.completed){
      match.completed=req.query.completed==='true'
  }
  if(req.query.sortBy){
      const part=req.query.sortBy.split(':')
      sort[part[0]]=part[1]==='desc'?-1:1
  }
  try{
      //const task=await tasks.find({})
     await req.user.populate({
         path:'tasks',
         match,
         options:{
             limit:parseInt(req.query.limit),//setting the limit how much data we want to see
             skip:parseInt(req.query.skip), //skip the number of datas
            //  sort:{
            //     // createdAt:1 //-1 for desecending/true and 1 for asscending/false
            //     completed:1
            //  }
            sort
         }
     }).execPopulate()
      res.status(201).send(req.user.tasks)
  }catch(e){
   res.status(404).send(e)
  }
   
})

//fetching the single task
router.get('/tasks/:id',auth,async (req,res)=>{
   const _id=req.params.id
   try{
      // const task=await tasks.findById(_id)
      const task=await tasks.findOne({_id,owner:req.user._id})
       if(!task){
          return res.status(404).send()
       }
       res.status(201).send(task)
   }catch(e){
       res.status(404).send(e)
   }
   
  
})


//updating the task
router.patch('/tasks/:id',auth,async (req,res)=>{
   const update_value=Object.keys(req.body)
   const allowedupdate=["description","completed"]
   const isvalid=update_value.every((update)=>{
       return allowedupdate.includes(update)
   })
   if(!isvalid){
       return res.status(404).send({error:'Invalid Update'})
   }
   try{
    // const task=await tasks.findById(req.params.id)
    const task= await tasks.findOne({_id:req.params.id,owner:req.user._id})
     if(!task){
         return res.status(404).send({error:'Cant find the taks'})
     }
     update_value.forEach((update)=>task[update]=req.body[update])
     await task.save()
     res.status(201).send(task)
   }catch(e){
          res.status(404).send({error:'final'})
   }
})

//deleting the task
router.delete('/tasks/:id',auth,async (req,res)=>{
   try{
      // const task=await tasks.findByIdAndDelete(req.params.id)
      const task=await tasks.findOneAndDelete({_id:req.params.id,owner:req.user._id})
       if(!task){
           return res.status(404).send()
       }

       res.send(task)
   }catch(e){
       res.status(404).send(e)
   }
})

module.exports=router