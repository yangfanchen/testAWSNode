const mongoose = require('mongoose')
const validator =require('validator')
const User = mongoose.model('User', {
    name: {
        type:String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        validate(value){
            if( value < 0){
                throw new error('Age must be a positive number')
            }
        }
    },
    email: {
        type:String,
        required: true,
        trim:true,
        lowercase: true,
        validate(value){
            if( !validator.isEmail(value)){
                throw new Errror('Email is not valid')
            }
        }
    }
})

module.exports = User