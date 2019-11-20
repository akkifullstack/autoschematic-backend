const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateShapeDetailInput(data) {
  let errors = {};
  data.partlink = !isEmpty(data.partlink) ? data.partlink : '';
  data.partname = !isEmpty(data.partname) ? data.partname : '';
  data.alter_part_no = !isEmpty(data.alter_part_no) ? data.alter_part_no : '';
  data.manufacture_part_no = !isEmpty(data.manufacture_part_no) ? data.manufacture_part_no : '';

  if(Validator.isEmpty(data.partlink)){
    errors.partlink = 'This field is Required';
  }
  // if(Validator.isEmpty(data.partname)){
  //     errors.partname = 'This field is Required';
  // }
  // if(Validator.isEmpty(data.alter_part_no)){
  //     errors.alter_part_no = 'This field is Required'
  // }

  // if(Validator.isEmpty(data.manufacture_part_no)){
  //     errors.manufacture_part_no = 'This field is required'
  // }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
