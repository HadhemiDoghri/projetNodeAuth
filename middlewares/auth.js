
function checkNotAuthentificated(req ,res ,next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next();
}

function checkAuthentificated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/authentification')
}
module.exports = {
    checkNotAuthentificated,
    checkAuthentificated,
}