const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Create Schema
const SchematicChildSchema = new Schema({
shapeId:{
    type: String
},
user_id: {
   type: Schema.Types.ObjectId,
   ref: 'users'
},
image: {
  type: String,
  required: true
},
assembly: {
  type:String
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
  SchematicChild = mongoose.model('schematicchild', SchematicChildSchema)
