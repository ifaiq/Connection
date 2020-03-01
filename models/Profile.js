const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const profile = new Schema({
    user: {

        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    handle: {
        type: String,
        required: true,
        max: 40
    },

    comapany: {
        type: String
    },
    website: {
        type: String
    },

    location:{
        type:String
    },

    status:{
        type:String,
        required:true

    
    },
    skills:{
        type:[String],
        required:true
    },
    bio:{
        type:String
    },
    git:{
        type:String
    },

    experience:[
        {
            title:{
                type:String,
                required:true
            },

            company:{
                type:String,
                required:true
            },
            from:{type:Date,
                required:true},
            to:{
                type:Date
            },
            current:{
                type:Boolean,
                default: false
            },

            location:{
                type:String
            },
            description:{
                type:String,
                required:true
            }

        }
    ],


    education:[
        {
            school:{
                type:String,
                required:true
            },

            degree:{
                type:String,
                required:true
            },
            field:{
                type:String,
                required:true
            },
            from:{type:Date,
                required:true},
            to:{
                type:Date
            },
            current:{
                type:Boolean,
                default: false
            },

            location:{
                type:String
            },
            description:{
                type:String,
                required:true
            }

        }
    ],
    social:{
        youtube:{
            type:String
        },
        twitter:{
            type:String
        },
        facebook:{
            type:String
        },
        linkedin:{
            type:String
        },
        insta:{
            type:String
        },
        date:{
            type:Date,
            default:Date.now
        }
    }


});

module.exports=mongoose.model('profile',profile)