const User = require("../models/User");
const Opinion = require("../models/OpinionForUser");
const Business = require("../models/Business");

const editProfileView = async (req, res) =>{
    const user = req.user;
    return res.render("editProfile", { user });
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
    editProfileView
}