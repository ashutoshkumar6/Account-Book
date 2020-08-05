const sgMail=require('@sendgrid/mail')

//const sendgridAPIKey='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'    we will send the api key to env variable for security purpose 

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'vicky691999@gmail.com',
        subject:'Welcome mail',
        text:`Welcome to the app ${name},Let me know how you get along with the app`
    }).then(()=>{
        console.log('Message sent')
    }).catch((error)=>{
        console.log(error.response.body.errors[0].message)
    })
}

const removeMail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'vicky691999@gmail.com',
        subject:'Cancelation Email',
        text:`Sorry to hear ${name},Let me know the reason for deactivating the account`
    }).then(()=>{
        console.log('Message sent')
    }).catch((error)=>{
        console.log(error.response.body.errors[0].message)
    })
}

module.exports={
    sendWelcomeEmail,
    removeMail
}