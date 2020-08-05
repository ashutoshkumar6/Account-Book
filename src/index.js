const express=require('express')

require('./db/mongoose')
const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')
const bcrypt=require('bcryptjs')//for hashing the pwd(library)
const multer=require('multer')//for uploading the file(library)

const app=express()
const port= process.env.PORT

// const upload=multer({
//     dest:'images',
//     limits:{
//         fileSize:1000000
//     },
//     fileFilter(req,file,cb){
//         if(!file.originalname.match(/\.(doc|docx)$/))
//         {
//             return cb(new Error('Please upload a word document'))
//         }
//         cb(undefined,true)
//     }
// })

// app.post('/upload',upload.single('upload'),(req,res)=>{
//     res.send()
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log('Server is up on the port'+port)
})


