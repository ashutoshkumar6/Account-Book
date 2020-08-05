const express=require('express')
const User=require('../models/users')
const router=new express.Router()
const jwt=require('jsonwebtoken')
const auth=require('../middleware/auth')
const multer=require('multer') //for file upload
const sharp=require('sharp') //for image formatting 
const {sendWelcomeEmail,removeMail}=require('../emails/account')
//creating new user
router.post('/users',async (req,res)=>{
    const user=new User(req.body)
    
    try{
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token=await user.generateAuthToken()
         res.status(201).send({user,token})
    }catch(e){
          res.status(404).send(e)
    }
})

//login 
router.post('/users/login',async (req,res)=>{
    try{
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token=await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
        res.status(404).send(e)
    }
})

//logging-out
router.post('/users/logout',auth,async (req,res,next)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()
        res.send()
    }catch(e)
    {
        res.status(505).send()
    }
})

//logging out from all devices
router.post('/users/logout-all',auth,async(req,res,next)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send()
    }catch(e)
    {
        res.status(505).send()
    }
})

//all fetched-users in database
router.get('/users/me',auth,async (req,res)=>{
   res.send(req.user)
})

//user we want fetch 
// router.get('/users/:id',async (req,res)=>{
    
//     const _id=req.params.id
//     try{
//        const user=await User.findById(_id)
//        if(!user){
//            return res.status(404).send()
//        }
//        res.status(201).send(user)
//     }catch(e){
//         res.status(404).send(e) 
//     }
// })

//updating the user id
router.patch('/users/me',auth,async (req,res)=>{
    const update_value=Object.keys(req.body)
    const allowedupdate=["name","email","age","password"]
    const isvalidupdate=update_value.every((update)=>{
        return allowedupdate.includes(update)
    })
    if(!isvalidupdate){
        return res.status(404).send({error:'Invalid update'})
    }
    try{
      // const user=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
    //    const user=await User.findById(req.params.id)

       update_value.forEach((update)=>{
           req.user[update]=req.body[update]
       })  
       await req.user.save()

       res.status(201).send(req.user)
    }catch(e){
        res.status(404).send({error:'Cant help'})
    }
})


//deleting the user
router.delete('/users/me',auth,async (req,res)=>{
    try{
        // const user=await User.findByIdAndDelete(req.user._id)
        // if(!user){
        //     return res.status(404).send()
        // }
        await req.user.remove()
        removeMail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(404).send({error:'not found'})
    }
})

//uploading user profile
const upload=multer({
    //dest:'avatars',    because we using buffer type
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))//this specific symbol is regex expression for more visit video no.125 or regex101.com
        {
            cb(new Error('Please upload valid image'))
        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer() //formatting the image

    req.user.avatar=buffer  //storing the image into binary form
    
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(404).send({error:error.message})//this done to show specific error instead of html error
})

//delete the user profile pic
router.delete('/users/me/avatar',auth,async (req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.status(201).send()
})

//fecth the user profile pic

router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user=await User.findById(req.params.id)
      if(!user|| !user.avatar)
      {
        throw new Error()
      }
       res.set('Content-Type','image/png')
       res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})

module.exports=router