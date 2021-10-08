const wrapAsync = function(func){
    return (req, res, next) => {
        func(req, res, next)
            .catch(next);
    }
}
//basically, we return a function that accepts a function and then it executes that function, it catches any error and passes it to next
//if there is any error, so we can now use this to wrap our asynchronous function.

module.exports = wrapAsync;