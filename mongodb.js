//CRUD Create read update Delete

// one way
// const mongodb=require('mongodb')
// //intitlaize the connection
// const MongoClient=mongodb.MongoClient

// another way
const {MongoClient,ObjectID}=require('mongodb')

//connection url
const connectionURL='mongodb://127.0.0.1:27017'
const databaseName='task-manager'

//getting ID
// const id=new ObjectID()
// console.log(id.id)
// console.log(id.toHexString().length)
//console.log(id.getTimestamp())

//establish the connection here
MongoClient.connect(connectionURL,{useNewUrlParser:true},(error,client)=>{
    if(error){
      return  console.log('Unable to connect to database')
    }
    const db=client.db(databaseName)
 
    db.collection('users').deleteMany({
        age:'26'
    }).then((result)=>{
        console.log(result)
    }).catch((error)=>{
        console.log(error)
    })

})
