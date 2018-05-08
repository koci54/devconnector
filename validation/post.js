const Validator = require('validator');
const isEmpty = require ('./is-empty');

module.exports = function validateLoginInput(data) {
  let errors = {};
  // ternary operator

  data.text = !isEmpty(data.text) ? data.text : '';

 if (!Validator.isLength(data.text, {min: 10, max: 300})) {
   errors.text = 'Text must be between 10 and 300 characters.'
 }


  if (Validator.isEmpty(data.text)) {
    errors.text = 'Text is invalid';
  }



  return {
    errors,
    isValid: isEmpty(errors)
  };
};
