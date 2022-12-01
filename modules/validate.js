/* eslint-disable linebreak-style */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
module.exports = function validate(data) {
  for (let index = 0; index < Object.entries(data).length; index++) {
    const el = Object.entries(data)[index];
    if (el[1] === undefined || el[1] === ' ' || el[1] === null) return `${el[0]} is not valid`;
  }
  return true;
};