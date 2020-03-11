const path = require('path')
const express = require('express')
const hbs = require('hbs')
const multer = require('multer')
const User = require('./models/user')
const Apt = require('./models/apt')
const Ad = require('./models/ad')
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
const viewsPath = path.join(__dirname,'../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

app.use(express.json())
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

app.use(express.static(publicDirectory))

app.get('/',(req,res) => {
    //res.send('This is a house renting web services')
    res.render('index', {
        title: 'test',
        name:'something'
    })
})

app.post('/user', (req, res) => {
    const user = new User(req.body)

    user.save().then( () => {
        res.send(user)
    }).catch((e) => {
        res.status(400)
        res.send(e)
    })
})

app.get('/users',(req,res) => {
    User.find({}).then( (users) => {
        res.send(users);
    }).catch ((e) => {
        res.status(500).send()
    })
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

app.delete('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user) {
            res.status(400).send()
        }
        res.send({success:'deletion operation successfully.'})
    }catch (e) {
        res.status(400).send(e)
    }
})

app.delete('/ads/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const ad = await Ad.findByIdAndDelete(req.params.id)
        if(!ad) {
            res.status(400).send()
        }
        res.send({success:'deletion operation successfully.'})
    }catch (e) {
        res.status(400).send(e)
    }
})

app.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','age','email']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if(!isValid){
        return res.status(400).send({error:'Invalid update opeartion'})
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id,req.body, {new: true, runValidators: true})
        
        if(!user) {
            return res.status(400).send()
        }
        res.send(user)
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
        const ad = await Ad.findByIdAndUpdate(req.params.id,req.body, {new: true, runValidators: true})
        
        if(!ad) {
            return res.status(400).send()
        }
        res.send(ad)
    } catch (e) {
        res.status(400).send(e);
    }
})



app.post('/apt', (req, res) => {
    const apt = new Apt(req.body)
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

app.post('/ad', (req, res) => {
    const ad = new Ad(req.body)
    ad.save().then( () => {
        res.send(ad)
    }).catch ((e) => {
        res.status(400)
        res.send(e)
    })
})


app.get('/apts', (req,res) => {
    console.log(req);
    res.send('This will return a list of apartments available for rental in campus');
})


app.get('/apts/2', (req,res) => {
    res.send({
        apt_id: 1,
        apt_locationc:'Spring garden road 1234'
    })
})

app.get('/ads', (req,res) => {
    res.send('This will return a list of apartments available for rental outside campus');
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