const path = require('path')
const express = require('express')
const hbs = require('hbs')
const multer = require('multer')
const User = require('./models/user')
const Apt = require('./models/apt')
const Ad = require('./models/ad')
const auth = require('../src/middleware/auth')
require('./db/mongoose')
const app = express()
console.log(__dirname);

const upload = multer({
    dest: 'images'
})

app.post('/apts/:id/upload',upload.single('upload'), (req, res) => {
    const id = req.url.split('/')[2]
    console.log(id)
    //console.log(req)
    res.send();
})
//use the public directory to access the html, css and javascript.
const publicDirectory = path.join(__dirname,'../public')
console.log(__dirname);
const viewsPath = path.join(__dirname,'/views')
const partialsPath = path.join(__dirname, '../templates/partials')

app.use(express.json())
app.set('view engine', 'ejs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

app.use(express.static(publicDirectory))

app.get('/',(req,res) => {
    //res.send('This is a house renting web services')
    res.render('index')
})

app.post('/user',async  (req, res) => {
    const user = new User(req.body)
    console.log(req.body.name)
    const exist = await User.findOne({name:req.body.name})
    
    if(exist) {
        res.status(400).send()
    } else {
    user.save().then( async() => {
        const Authtoken = await user.AuthToken()
        res.send({user,Authtoken })
    }).catch((e) => {
        res.status(400)
        res.send(e)
    })
    }
})

app.post('/user/login', async (req,res) => {
    try{
        const user = await User.Validation(req.body.name, req.body.password)
        const Authtoken = await user.AuthToken()
        res.send({user, Authtoken})
    }catch (e) {
        res.status(400).send()
    }
})

app.post('/users/this/logout',auth,async (req,res) => {
    try{
        req.user.AuthTokens = req.user.AuthTokens.filter((token) => {
            return token.AuthToken !== req.token
        })
        await req.user.save()
        res.send()
    }catch(e) {
        res.status(500).send()
    }
})

app.post('/users/this/logoutAllSession',auth, async (req,res)=> {
    try{
        req.user.AuthTokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

app.get('/users/this',auth,async (req,res) => {
    res.send(req.user)
})


app.get('/users/:id', (req, res) => {
    const _id = req.params.id

    User.findById(_id).then( (user ) => {
        if(!user) {
            return res.status(404).send()
        }
        res.send(user);
    }).catch((e) => {
        res.status(500).send()
    })
})

app.delete('/users/this',auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    }catch (e) {
        res.status(400).send(e)
    }
})

app.delete('/ads/:id',auth,async (req, res) => {
    const _id = req.params.id

    try {
        const ad = await Ad.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!ad) {
            res.status(400).send()
        }
        res.send({success:'deletion operation successfully.'})
    }catch (e) {
        res.status(400).send(e)
    }
})

app.patch('/users/this',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','age','email','password']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if(!isValid){
        return res.status(400).send({error:'Invalid update opeartion'})
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e);
    }
})


app.patch('/ads/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','rent','location']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if(!isValid){
        return res.status(400).send({error:'Invalid update opeartion'})
    }

    try {
        //const ad = await Ad.findByIdAndUpdate(req.params.id,req.body, {new: true, runValidators: true})
        const ad = await Ad.findOne({_id:req.params.id, owner:req.user._id})
        if(!ad) {
            return res.status(404).send()
        }
        updates.forEach((update) => ad[update]=req.body[update])
        await ad.save()
        res.send(ad)
    } catch (e) {
        res.status(400).send(e);
    }
})



app.post('/apt',auth,async (req, res) => {
    // const apt = new Apt(req.body)
    const apt = new Apt({
        ...req.body,
        owner: req.user._id
    })
    apt.save().then( () => {
        res.send(apt)
    }).catch ((e) => {
        res.status(400)
        res.send(e)
    })
})

app.get('/apts', (req,res) => {
    Apt.find({}).then( (apts) => {
        res.send(apts)
    }).catch( (e) => {
        res.status(500).send(e)
    })
})

app.get('/apts/:id', (req,res) => {
    const _id = req.params.id
    Apt.find({_id}).then( (apt) => {
        if(!apt) {
            res.status(404).send()
        }
        res.send(apt)
    }).catch( (e) => {
        res.status(500).send(e)
    })
})

app.get('/ads', (req,res) => {
    Ad.find({}).then( (ads) => {
        res.send(ads)
    }).catch( (e) => {
        res.status(500).send(e)
    })
})

app.get('/ads/:id', (req,res) => {
    const _id = req.params.id
    Ad.find({_id}).then( (ad) => {
        if(!ad) {
            res.status(404).send()
        }
        res.send(ad)
    }).catch( (e) => {
        res.status(500).send(e)
    })
})

app.post('/ads/:id/comment', (req,res) =>{
    const _id = req.params.id
    console.log(_id)
    console.log(req.body)
    Ad.findOne({_id}).then(async (ad) => {
        if(!ad) {
            res.status(404).send()
        }else{
            ad.comments.push(req.body.comment)
            await ad.save()
            res.status(200).send({success:"post comments successfully"})
        }
    }).catch( (e) => {
        console.log(e)
        res.status(500).send(e)
    })
})


app.post('/apts/:id/comment', (req,res) =>{
    const _id = req.params.id
    console.log(_id)
    console.log(req.body)
    Apt.findOne({_id}).then(async (apt) => {
        if(!apt) {
            res.status(404).send()
        }else{
            apt.comments.push(req.body.comment)
            await apt.save()
            res.status(200).send({success:"post comments successfully"})
        }
    }).catch( (e) => {
        res.status(500).send(e)
    })
})

app.post('/ad',auth,async (req, res) => {
    // const ad = new Ad(req.body)
    const ad = new Ad({
        ...req.body,
        owner: req.user._id
    })
    ad.save().then( () => {
        res.send(ad)
    }).catch ((e) => {
        res.status(400)
        res.send(e)
    })
})

 


app.get('/apts/2', (req,res) => {
    res.send({
        apt_id: 1,
        apt_locationc:'Spring garden road 1234'
    })
})


app.get('*', (req, res) => {
    res.render('404', {
        title:'404',
        name:'ABC def',
        errorMessage:'Page not found'
        
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log('Server is running up on port 3000')
})