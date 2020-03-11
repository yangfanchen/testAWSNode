const mongoose = require('mongoose')
const Ad = mongoose.model('Ad', {
    name: {
        type:String,
        required: true,
        trim: true
    },
    rent: {
        type: Number,
        required: true,
        validate(value){
            if( value < 0){
                throw new error('Age must be a positive number')
            }
        }
    },
    location: {
        type:String,
        required: true,
        trim:true
    },
    post_by: {
        type:String, 
        required: true
    }
})

module.exports = Ad