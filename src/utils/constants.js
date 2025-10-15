const USER_FIELDS_ALLOWED_TO_UPDATE = [
  'DOB',
  'gender',
  'photoUrl',
  'about',
  'games',
  'otherGames',
]

const PASSWORD_FIELDS_ALLOWED = [
  'existingPassword',
  'newPassword',
  'confirmNewPassword',
]

module.exports = {
  userAllowedFields: USER_FIELDS_ALLOWED_TO_UPDATE,
  passwordChangeAllowedFields: PASSWORD_FIELDS_ALLOWED,
}
