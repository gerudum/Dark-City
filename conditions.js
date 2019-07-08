module.exports = {
    GreaterThan: function (a,b){
        return (a >= b);
    },
    LessThan: function (a,b){
        return (a <= b);
    },
    Contains: function(array, thing){
        return array.contains(thing);
    }
}