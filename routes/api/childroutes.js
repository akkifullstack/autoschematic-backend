if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

const mongoose = require('mongoose')
const express = require('express');
const router = express.Router();
const multer = require('multer');
const passport = require('passport');
const _ = require('lodash');
const azure = require('azure-storage');
const blobService = azure.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING)
const getStream = require('into-stream');





var storage = multer.memoryStorage()


const getBlobName = () => {
  const identifier = Math.random().toString().replace(/0\./, '')
  return `${identifier}-${Date.now()}.jpg`
}

const upload = multer({
  storage
});

const SchematicChild = require('../../models/SchematicChild');




//  @route child/create-schematics-child
//  @desc Creating Schematic Shapes Child

router.post('/create-schematics-child', passport.authenticate('jwt', {
  session: false
}), upload.single('image'), (req, res) => {

  const blobName = getBlobName(req.file.filename);
  const stream = getStream(req.file.buffer);
  const streamLength = req.file.buffer.length


  blobService.createBlockBlobFromStream('schematicimages', blobName, stream, streamLength, err => {

    if (err) {
      res.json(err)
    }
    let schematicsChild = _.pick(req.body, ['shapeId', 'assembly']);
    schematicsChild.image = `https://automaticschematic.azureedge.net/schematicimages/${blobName}`;
    schematicsChild.user_id = req.user._id;
    const SchematicsChild = new SchematicChild(schematicsChild);
    SchematicsChild.save().then(schematicChild => res.status(200).json({
      message: 'FileUploaded',
      schematic: schematicChild
    })).catch(err => res.status(400).json(err));
  })
})

/**----------------------------------------------------------------------------------------------------- */

//  @route child/get-schematics-child/:id
//  @desc Fetching Schematic Shapes Child


router.get('/get-schematics-child/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  SchematicChild.find({
    shapeId: req.params.id
  }).then(schematicsChild => res.status(200).json(schematicsChild)).catch(err => res.status(400).json(err));
})

/**----------------------------------------------------------------------------------------------------- */

//  @route child/update-schematics-child/:id
//  @desc Update Schematic Shapes Child

router.put('/update-schematic-child/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  let childId = req.params.id;
  SchematicChild.findOneAndUpdate({
    shapeId: childId
  }, {
    $set: {
      shapes: req.body
    }
  }).then(updatedSchematic => res.status(200).json(updatedSchematic)).catch(err => res.status(400).json(err));
})

/**----------------------------------------------------------------------------------------------------- */

//  @route child/addChildshapedetails/:id
//  @desc adding Shape details Schematic Shapes Child

router.put('/addChildshapedetails/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  let shapedetails = {
    shapeid: req.body.shapeid,
    partname: req.body.partname,
    partlink: req.body.partlink
  }
  SchematicChild.findOneAndUpdate({
    shapeId: req.params.id
  }, {
    $push: {
      shapeDetails: shapedetails
    }
  }).then(SchematicChild => res.status(200).json(SchematicChild)).catch(err => res.status(400).json(err));
})


/**----------------------------------------------------------------------------------------------------- */

// @route child/updateChildDetails/:id/:sid
// @desc Updating Details of Child Schematic's Shapes

router.put('/updateChildDetails/:id/:sid', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  let schematicId = req.params._id;
  let shapeId = req.params.sid;
  SchematicChild.update({
    shapeId: req.params.id,
    "shapeDetails.shapeid": shapeId
  }, {
    $set: {
      "shapeDetails.$.partlink": req.body.partlink,
      "shapeDetails.$.partname": req.body.partname
    }
  }).then(updatedShapeDetail => res.status(200).json(updatedShapeDetail)).catch(err => {
    console.log(err)
    res.status(400).json(err)
  });
})

/**----------------------------------------------------------------------------------------------------- */

// @route child/get-Child-schematics
// @desc Admin Purpose

router.get('/get-Child-schematics', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  SchematicChild.find({
    user_id: req.user._id
  }).then(schematicChild => res.status(200).json(schematicChild)).catch((err) => res.status(400).json(err));
})


/**----------------------------------------------------------------------------------------------------- */

// @route child/user-schematics-child/:id
// @desc User View Schematic's Shapes Child 

router.get('/user-schematics-child/:id', (req, res) => {
  SchematicChild.find({
    shapeId: req.params.id
  }).then(schematicsChild => res.status(200).json(schematicsChild)).catch(err => res.status(400).json(err));
})

/**----------------------------------------------------------------------------------------------------- */

// @route /child/get-all-Child-schematics
// @desc User View Schematic's Shapes Child 


router.get('/get-all-Child-schematics', (req, res) => {
  SchematicChild.find().then(schematicChild => res.status(200).json(schematicChild)).catch((err) => res.status(400).json(err));
})



module.exports = router;