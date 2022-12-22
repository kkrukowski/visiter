const Business = require("../models/Business");
const User = require("../models/User");


const registerView = (req, res) => {
    if(req.user.role == "Owner"){
        console.log("Jestes ownerem, nie mozesz rejestrowac firmy")
        res.redirect("/business")
    }
    res.render("businessRegister", message = "");
}

const registerBusiness = async (req, res) =>{
    User.findOneAndUpdate({ id: req.user.id }, {role: "Owner"}, function(error, result){
        if(error){
            console.log("False")
        }
        else{
            console.log("True")
        }
    });

    try{
        const createBusiness = new Business({
            id: Date.now().toString(),
            name: req.body.name,
            description: req.body.name,
            owner: req.user,
            adress: req.body.adress,
            phone: req.body.phone,
        
            workers: null,
            opinions: null,
            services: null
        });

        console.log(createBusiness)
        createBusiness.save();
        res.redirect("/")
    } catch {
        res.redirect("/business/register")
    }
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

    Business.findOneAndDelete({'owner.id': req.user.id});
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