const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Create Schema
const SchematicsSchema = new Schema({
  category: {
    type: String,
    required: true
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  style: {
    type: String,
    required: true
  },
  years: {
    type: Array,
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  assembly: {
    type:String
  },
  image: {
    type: String
  },
  shapes:{
    type:Object,

    default:null
},
shapeDetails:{
  type:Array,
  default:null
}
}, { timestamps: true });

module.exports =
  Schematic = mongoose.model('schematic', SchematicsSchema)
