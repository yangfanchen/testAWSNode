const path = require('path')
const express = require('express')
const hbs = require('hbs')


const app = express()
console.log(__dirname);

//use the public directory to access the html, css and javascript.
const publicDirectory = path.join(__dirname,'../public')
const viewsPath = path.join(__dirname,'../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

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