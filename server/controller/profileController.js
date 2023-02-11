const User = require("../models/User");
const Opinion = require("../models/OpinionForUser");
const Business = require("../models/Business");

const editProfileView = async (req, res) =>{
    const user = req.user;
    return res.render("editProfile", { user });
};

const editProfile = (req, res) => {
    if(req.body.name && req.body.surname){
        User.findByIdAndUpdate(req.params.id, {name: req.body.name, surname: req.body.surname}, {new: true}, (err, user) =>{
            if(err){
                return res.render("editProfile", {user, message: err})
            }
            else{
                return res.render("editProfile", {user, message: "Edycja pomyślna."})
            }
        });
    } else if(req.body.email){
        User.findByIdAndUpdate(req.params.id, {email: req.body.email}, {new: true}, (err, user) =>{
            if(err){
                return res.render("editProfile", {user, message: err})
            }
            else{
                return res.render("editProfile", {user, message: "Edycja pomyślna."})
            }
        });        
    } else if(req.body.phone){ 
        var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{3})$/; //validation of phone
        if (!re.test(req.body.phone)) {
            const message = "Podaj prawidłowy numer telefonu.";
            const user = req.user;
            return res.render("editProfile", {user, message});
        }
        User.findByIdAndUpdate(req.params.id, {phone: req.body.phone}, {new: true}, (err, user) =>{
            if(err){
                return res.render("editProfile", {user, message: err})
            }
            else{
                return res.render("editProfile", {user, message: "Edycja pomyślna."})
            }
        });
    } else if(req.body.country){
        User.findByIdAndUpdate(req.params.id, {country: req.body.country}, {new: true}, (err, user) =>{
            if(err){
                return res.render("editProfile", {user, message: err})
            }
            else{
                return res.render("editProfile", {user, message: "Edycja pomyślna."})
            }
        });
    } else if(req.body.city){
        User.findByIdAndUpdate(req.params.id, {city: req.body.city}, {new: true}, (err, user) =>{
            if(err){
                return res.render("editProfile", {user, message: err})
            }
            else{
                return res.render("editProfile", {user, message: "Edycja pomyślna."})
            }
        });
    }
};

const getUser = (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if (req.params.id === req.session.passport.user) {
            return res.render("profile", { user: user, isSameUser: true });
        }
        return res.render("profile", { user: user, isSameUser: false });
    });
};

const addOpinion = async (req, res) => {
    correctName = req.user.name + " " + req.user.surname;
    var foundBusiness = undefined;
    if (req.user.role == "Worker") {
        console.log("worker halo");
        foundBusiness = await Business.findOne({
            workers: { $elemMatch: { _id: req.user._id } },
        });
    } else if (req.user.role == "Owner") {
        console.log("owner halo");
        foundBusiness = await Business.findOne({ "owner._id": req.user._id });
    } // bugged here
    console.log(foundBusiness.name);
    console.log("ELO" + foundBusiness._id);
    if (foundBusiness == undefined) {
        return res.redirect("/"); // wyswietl error
    }
    const newOpinion = new Opinion({
        rating: req.body.rating,
        comment: req.body.comment,
        ownerId: req.user._id,
        ownerName: correctName,
        businessName: foundBusiness.name,
        businessId: foundBusiness._id,
    });

    User.findById(req.params.id, (err, user) => {
        if (user.opinions.length != 0) {
            User.findByIdAndUpdate(
                req.params.id,
                { $addToSet: { opinions: newOpinion } },
                (err, user) => {
                    console.log("OPINIA");
                    console.log(newOpinion);
                    console.log(err);
                    console.log(user);
                    return res.redirect("/");
                }
            );
        } else {
            User.findByIdAndUpdate(
                req.params.id,
                { $set: { opinions: newOpinion } },
                (err, user) => {
                    console.log(err);
                    console.log(user);
                    return res.redirect("/");
                }
            );
        }
    });
};

module.exports = {
    getUser,
    addOpinion,
    editProfileView,
    editProfile
}