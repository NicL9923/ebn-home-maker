export const FieldTypes = {
  Email: {
    name: 'email',
    regex: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, // Has only one @, and >0 chars before @ and before/after the period + eliminate whitespaces
    valErrMsg: 'Please provide a valid email',
  },
  Password: {
    name: 'password',
    regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, // >=8 chars + >0 letter and number
    valErrMsg: 'Password must be a minimum of eight characters, and contain at least one letter and number',
  },
  EntityName: {
    name: 'entityName',
    regex: /^[\s\S]{1,25}$/, // Any (whitespace/non-whitespace) characters, 1-25 chars
    valErrMsg: 'Entity names have a max length of 25 characters',
  },
  ItemName: {
    name: 'itemName',
    regex: /^[\s\S]{1,100}$/, // Any (whitespace/non-whitespace) characters, 1-100 chars
    valErrMsg: 'Item names have a max length of 100 characters',
  },
  ApiToken: {
    name: 'apiToken',
    regex: /^[A-Za-z0-9_-]*$/, // Only letters, numbers, hyphens, and underscores
    valErrMsg: 'API tokens can only contain letters, numbers, hyphens, and underscores',
  },
  DecimalNum: {
    name: 'decimalNum',
    regex: /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/, // Optional sign, optional decimal, numbers only *Note: will accept just a period or sign, so handle that too
    valErrMsg: 'Numerical values can only contain numbers, decimals, and signs',
  },
};

export const ValidationErrorMsgs = {
  Empty: 'Field cannot be empty',
  ItemNameUnique: 'Item names must be unique',
};