const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateLoginInput(data) {
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : '';
  if (!Validator.isLength(data.text,{min:1,max:280})) {
    errors.text = 'text too long';
  }

  

  if (Validator.isEmpty(data.text)) {
    errors.text = 'text field is required';
  }


  return {
    errors,
    isValid: isEmpty(errors)
  };
};
