const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')

function initialize(passport , getUserByEmail, getUserById){
    const authentificaterUser = async (email, password, done)=>{
        const user =await getUserByEmail(email);
        if(user == null){
            return done(null, false, {message:"no user with that email"})
        }
        try{
            if(await bcrypt.compare(password, user.password)){
                return done(null, user);
            }else{
                return done(null, false, {message: "password incorrect"})
            }
        }catch(err){
            return done(e)
        }
    }
    passport.use(new localStrategy({usernameField:'email'}, authentificaterUser))
    passport.serializeUser((user,done) => done(null, user.id));
    passport.deserializeUser(async (id, done)=>{
        return done(null, await getUserById(id))
    })
}
module.exports = initialize;

