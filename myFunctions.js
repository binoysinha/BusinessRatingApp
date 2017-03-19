//var _ = require('underscore');

const arrayAverage = (arr) => {
    return arr.reduce((num1, num2) => {
        return num1 + num2;
    }, 0) / (arr.length === 0 ? 1 : arr.length);
}
 export default arrayAverage;
//module.exports = {arrayAverage};