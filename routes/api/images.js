
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

const mongoose = require('mongoose')
const express = require('express');
const router = express.Router();
var xFrameOptions = require('x-frame-options')
const multer = require('multer');
const passport = require('passport');
const _ = require('lodash');
const azure = require('azure-storage');
const blobService = azure.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING)
const getStream = require('into-stream');

const validateShapeDetailInput = require('../../validation/shapedetails');

var storage = multer.memoryStorage()
  





// @desc Creating Blob name before Uploading Image


const getBlobName = () => {
  const identifier = Math.random().toString().replace(/0\./,'')
  return `${identifier}-${Date.now()}.jpeg`
}

const upload = multer({ storage });

const Schematic = require('../../models/Schematic');



/**----------------------------------------------------------------------------------------------------- */


// @route schematics/create-schematics
// @desc Creating Schematic Information


router.post('/create-schematics', passport.authenticate('jwt', { session: false }),  (req, res) => {
        let schematics = _.pick(req.body,['make','years','style','model','category']);
        schematics.user_id = req.user._id;
        const Schematics = new Schematic(schematics);
        Schematics.save().then(schematic => res.status(200).json({schematic:schematic})).catch(err => res.status(400).json(err));
})
   

/**----------------------------------------------------------------------------------------------------- */


// @route schematics/upload-schematic/:_id
// @desc Adding Image from canvas After Adding Basic details

router.put('/upload-schematic/:_id', passport.authenticate('jwt', { session: false }), upload.single('image'), (req, res) => {
 
  const blobName = getBlobName(req.file.filename);
  const stream = getStream(req.file.buffer);
  const streamLength = req.file.buffer.length

  console.log(blobName)

  blobService.createBlockBlobFromStream('schematicimages', blobName, stream, streamLength, err => {

    if(err) {
        res.json(err)
    }
      let assembly = req.body.assembly;
      let image = `https://automaticschematic.azureedge.net/schematicimages/${blobName}`;
      Schematic.update({_id: req.params._id},{$set:{image: image, assembly: assembly}}).then((schematic) =>  res.status(200).json({image:image})).catch((err) => res.status(400).json(err))

})
 
})


/**----------------------------------------------------------------------------------------------------- */


// @route schematics/get-schematic/:_id
// @desc Get single schematic

router.get('/get-schematic/:_id',  passport.authenticate('jwt', { session: false }), (req, res) => {
  Schematic.findById(req.params._id).sort({_id:-1}).then((schematic) =>  res.status(200).json(schematic)).catch((err) => res.status(400).json(err))
})



/**----------------------------------------------------------------------------------------------------- */


// @route schematics/update-schematics/:_id
// @desc Edit Schematics Fields



router.put('/update-schematics/:_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Schematic.findByIdAndUpdate(req.params._id).exec((err, schematic) =>{
      if(err){
        res.status(400)
          .json(err)
      }else{
        schematic.make = req.body.make,
        schematic.style = req.body.style,
        schematic.years = req.body.years,
        schematic.model = req.body.model,
        schematic.category = req.body.category
      }
      schematic.save((err, updatedSchamtic) => {
        if(err){
          res.status(400)
             .json(err)
        }else{
          res.status(200)
             .json(updatedSchamtic)
        }
      })

    })

})


/**----------------------------------------------------------------------------------------------------- */


// @route schematics/delete-schematics/:id
// @desc Deleting Schematic 



router.delete('/delete-schematics/:id', passport.authenticate('jwt', {session:false}), (req, res) => {
  Schematic.findByIdAndRemove(req.params.id).then(schematic => res.status(200).json(schematic)).catch(err =>  res.status(400).json(err))
})


/**----------------------------------------------------------------------------------------------------- */



// @route  schematics/get-one-schematic/:_id
// Getting All Schematics Related To Specific User


router.get('/get-one-schematic/:_id', (req, res) => {
  Schematic.findById(req.params._id).then((schematic) =>  res.status(200).json(schematic)).catch((err) => res.status(400).json(err))
})

router.get('/get-schematics', passport.authenticate('jwt', { session: false }), (req, res) => {
    Schematic.find({user_id:req.user._id}).sort({_id: -1}).then(schematics => res.status(200).json(schematics)).catch(err => res.status(400).json(err));
})


/**----------------------------------------------------------------------------------------------------- */




// @route schematics/update-schematic/:_id
// @desc Getting Updating Specific Schematic with it Screen Shots of Shapes Designed By User 


router.put('/update-schematic/:_id',passport.authenticate('jwt', {session:false}), (req, res) => {
  let schematicId = req.params._id;
  console.log(req.body)
  Schematic.findByIdAndUpdate(schematicId,{ $set :{shapes:req.body}}).then(updatedSchematic => res.status(200).json(updatedSchematic)).catch(err => res.status(400).json(err));
})


/**----------------------------------------------------------------------------------------------------- */


// @route schematics/addshapedetails/:_id
// @desc Adding Updating Specific Schematic' Shapes Details 


router.put('/addshapedetails/:_id',passport.authenticate('jwt', {session:false}), (req, res) => {
  let schematicId = req.params._id;
  let shapedetails = {
    shapeid: req.body.shapeid,
    partname: req.body.partname,
    partlink: req.body.partlink,
    manufacture_part_no:req.body.manufacture_part_no,
    alter_part_no:req.body.alter_part_no
  }
  const { errors, isValid } = validateShapeDetailInput(req.body);

  // Check Validation

      // Schematic.findOne({shapeDetails: {$elemMatch:{partname: req.body.partname}}}).then(shape => {
      //     if(shape){
      //       errors.partname = 'Partname already exists';
      //       res.status(400).json(errors)
      //     }else{
            Schematic.findByIdAndUpdate(schematicId,{ $addToSet :{shapeDetails:shapedetails}}).then(updatedSchematic => res.status(200).json(updatedSchematic)).catch(err => res.status(400).json(err));
          // }
      // })
 
    })



/**----------------------------------------------------------------------------------------------------- */



// @route  schematics/delete-schematic/:_id
// @desc Delete Schematic 

router.delete('/delete-schematic/:_id', passport.authenticate('jwt', {session:false}), (req, res) => {
  Schematic.findByIdAndRemove(req.params._id).then((schematic) => res.status(200).json("Schematic Deleted")).catch((err) => res.status(400).json(err))
})



/**----------------------------------------------------------------------------------------------------- */



// @route  schematics/updateSdetails/:_id/:sid
// @desc Updating Details Of Shapes 


router.put('/updateSdetails/:_id/:sid',passport.authenticate('jwt', {session:false}), (req, res) => {
  let schematicId = req.params._id;
  let shapeId = req.params.sid;
  let query = ({_id:schematicId, "shapeDetails.$.shapeid":shapeId})
  let query2 = ({$set:{"shapeDetails.$.partlink":req.body.partlink, "shapeDetails.$.partname":req.body.partname}})
  console.log(query, query2)
  Schematic.update({_id:schematicId, "shapeDetails.shapeid":shapeId},{$set:{"shapeDetails.$.partlink":req.body.partlink, "shapeDetails.$.partname":req.body.partname, "shapeDetails.$.manufacture_part_no":req.body.manufacture_part_no,"shapeDetails.$.alter_part_no":req.body.alter_part_no}}).then(updatedShapeDetail => res.status(200).json(updatedShapeDetail)).catch(err => {
    console.log(err)
    res.status(400).json(err)
    });
})


/**----------------------------------------------------------------------------------------------------- */


// @route  schematics/all-schematics
// @desc Getting All Schematics For User Side that can Have only read only and Selecting Shapes Permission


router.get('/all-schematics', (req, res) => {
  Schematic.find().populate('user_id').then((Schematic) => res.status(200).json(Schematic)).catch((err) => res.status(400).json(err))
})

module.exports = router;
