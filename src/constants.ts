export const RegEx = {
  Email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, // Has only one @, and >0 chars before @ and before/after the period + eliminate whitespaces
  Password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, // >=8 chars + >0 letter and number
  EntityName: /^[\s\S]{1,25}$/, // Any (whitespace/non-whitespace) characters, 1-25 chars
  ItemName: /^[\s\S]{1,100}$/, // Any (whitespace/non-whitespace) characters, 1-100 chars
  ApiToken: /^[A-Za-z0-9_-]*$/, // Only letters, numbers, hyphens, and underscores
  DecimalNum: /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/, // Optional sign, optional decimal, numbers only *Note: will accept just a period or sign, so handle that too
};

export const ValidationErrorMsgs = {
  Empty: 'Field cannot be empty',
  EmailRegex: 'Please provide a valid email',
  PasswordRegex: 'Password must be a minimum of eight characters, and contain at least one letter and number',
  ProfileNameRegex: 'Entity names have a max length of 25 characters',
  ItemNameRegex: 'Item names have a max length of 100 characters',
  ItemNameUnique: 'Item names must be unique',
  ApiTokenRegex: 'API tokens can only contain letters, numbers, hyphens, and underscores',
  DecimalNumRegex: 'Numerical values can only contain numbers, decimals, and signs',
};
