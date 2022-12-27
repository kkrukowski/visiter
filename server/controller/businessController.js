const Business = require("../models/Business");
const User = require("../models/User");
const Opinion = require("../models/Opinion");


const registerView = (req, res, err, message = "") => {
    if(req.user.role == "Owner"){
        console.log("Jestes ownerem, nie mozesz rejestrowac firmy")
        res.redirect("/business")
    }
    res.render("businessRegister", {message: message});
}

const registerBusiness = async (req, res) =>{
    correctName = 
        req.body.name.charAt(0).toUpperCase() +
        req.body.name.slice(1).toLowerCase();
    correctDesc = 
        req.body.description.charAt(0).toUpperCase() +
        req.body.description.slice(1);

    var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{3})$/; //validation of phone
    if(!re.test(req.body.phone)){
        const message = "Podaj prawidłowy numer telefonu."
        return registerView(req, res, "", message)
    }

    User.findOneAndUpdate({ _id: req.user._id }, {role: "Owner"}, function(error, result){
        if(error){
            console.log("False")
        }
        else{
            console.log("True")
        }
    });

    try{
        const createBusiness = new Business({
            name: correctName,
            description: correctDesc,
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
    User.findOneAndUpdate({ _id: req.user._id }, {role: "User"}, function(error, result){
        if(error){
            console.log("False")
        }
        else{
            console.log("True")
        }
    }, {new: true})

    Business.findOneAndDelete({'owner.id': req.user._id});
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

const getAllBusiness = (req, res) => {
    Business.find({}, function (err, business){
        if(err){
            return res.render("searchBusiness");
        }
        return res.render("searchBusiness", {businesses: business})
    })
}

const getBusiness = (req, res) => {
    Business.findById(req.params.id, (err, business) =>{
        return res.render("specificBusiness", {business: business, Users: User})
    })
}

const addOpinion = (req, res) => {
    const newOpinion = new Opinion({
        rating: req.body.rating,
        comment: req.body.comment,
        owner: req.user._id
    })
    Business.findByIdAndUpdate(req.params.id, {$addToSet: {opinions: newOpinion}}, (err, business) =>{
        return res.redirect("/")
    })
}

module.exports = {
    registerView,
    registerBusiness,
    homeView,
    refreshRole,
    getAllBusiness,
    getBusiness,
    addOpinion
}