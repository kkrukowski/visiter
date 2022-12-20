const registerView = (req, res) => {
    if(req.user.role == "Owner"){
        console.log("Jestes ownerem, nie mozesz rejestrowac firmy")
        res.redirect("/business")
    }
    res.render("businessRegister", message = "");
}
const registerBusiness = (req, res) =>{
    console.log(req.body);
    console.log(req.user);
    User.findOneAndUpdate({ id: req.user.id }, {role: "Owner"}, function(error, result){
        if(error){
            console.log("False")
        }
        else{
            console.log("True")
        }
    })
    console.log(req.user);
    res.redirect("/")
}

const refreshRole = (req, res) =>{
    console.log(req.user)
    User.findOneAndUpdate({ id: req.user.id }, {role: "User"}, function(error, result){
        if(error){
            console.log("False")
        }
        else{
            console.log("True")
        }
    }, {new: true})
    console.log(req.user);
    res.redirect("/");
}

const homeView = (req, res) => {
    if(req.user.role == "Owner"){
        console.log("Jestes ownerem, dostep mozliwy");
        res.render("business");
    }
    else{
        res.redirect("/business/register");
    }
}

module.exports = {
    registerView,
    registerBusiness,
    homeView,
    refreshRole
}