const User = require("../models/User");
const Opinion = require("../models/OpinionForUser");
const Business = require("../models/Business");

const editProfileView = async (req, res) => {
    const user = req.user;
    return res.render("editProfile", { user });
};

const editProfile = (req, res) => {
    if (req.body.name && req.body.surname) {
        User.findByIdAndUpdate(req.params.id, { name: req.body.name, surname: req.body.surname }, { new: true }, (err, user) => {
            if (err) {
                return res.render("editProfile", { user, message: err })
            }
            else {
                return res.render("editProfile", { user, message: "Edycja pomyślna." })
            }
        });
    } else if (req.body.email) {
        User.findByIdAndUpdate(req.params.id, { email: req.body.email }, { new: true }, (err, user) => {
            if (err) {
                return res.render("editProfile", { user, message: err })
            }
            else {
                return res.render("editProfile", { user, message: "Edycja pomyślna." })
            }
        });
    } else if (req.body.phone) {
        var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{3})$/; //validation of phone
        if (!re.test(req.body.phone)) {
            const message = "Podaj prawidłowy numer telefonu.";
            const user = req.user;
            return res.render("editProfile", { user, message });
        }
        User.findByIdAndUpdate(req.params.id, { phone: req.body.phone }, { new: true }, (err, user) => {
            if (err) {
                return res.render("editProfile", { user, message: err })
            }
            else {
                return res.render("editProfile", { user, message: "Edycja pomyślna." })
            }
        });
    } else if (req.body.country) {
        User.findByIdAndUpdate(req.params.id, { country: req.body.country }, { new: true }, (err, user) => {
            if (err) {
                return res.render("editProfile", { user, message: err })
            }
            else {
                return res.render("editProfile", { user, message: "Edycja pomyślna." })
            }
        });
    } else if (req.body.city) {
        User.findByIdAndUpdate(req.params.id, { city: req.body.city }, { new: true }, (err, user) => {
            if (err) {
                return res.render("editProfile", { user, message: err })
            }
            else {
                return res.render("editProfile", { user, message: "Edycja pomyślna." })
            }
        });
    }
};

const getUser = (req, res) => {
    User.findById(req.params.id, (err, user) => {
        const opinionsIds = user.opinions;
        Opinion.find({ "_id": { $in: opinionsIds } }, (err, opinions) => {
            var userIds = [];
            opinions.forEach((opinion) => {
                userIds.push(opinion.ownerId);
            })
            console.log("USERIDS", userIds)
            User.find({ "_id": { $in: userIds } }, (err, users) => {
                var userInfo = [];
                users.forEach((user) => {
                    userInfo.push(user.name)
                });
                console.log("USERINFO", userInfo);
                var businessIds = [];
                opinions.forEach((opinion) => {
                    businessIds.push(opinion.businessId);
                })
                console.log(businessIds);
                Business.find({ "_id": { $in: businessIds } }, (err, businesses) => {
                    var businessInfo = [];
                    businesses.forEach((business) => {
                        console.log(business.name)
                        businessInfo.push(business.name)
                    });
                    console.log("BUSINESSINFO", businessInfo)
                    if (req.params.id === req.session.passport.user) {
                        return res.render("profile", { user: user, opinions, isSameUser: true });
                    }
                    return res.render("profile", { user: user, opinions, isSameUser: false });
                })
            });
        });
    });
};

const addOpinion = (req, res) => {
    correctName = req.user.name + " " + req.user.surname;
    if (req.user.role == "Worker") {
        Business.findOne({ workers: req.user._id, }, (err, business) => {
            const newOpinion = new Opinion({
                rating: req.body.rating,
                comment: req.body.comment,
                ownerId: req.user._id,
                businessId: business._id,
            });
            newOpinion.save((err, opinion) => {
                if (err) {
                    return res.redirect("/");
                } else {
                    User.findByIdAndUpdate(req.params.id, { $push: { opinions: opinion } }, { new: true }, (err, user) => {
                        return res.redirect("/") //dodac render
                    });
                };
            });
        });
    } else if (req.user.role == "Owner") {
        Business.findOne({ "owner._id": req.user._id }, (err, business) => {
            const newOpinion = new Opinion({
                rating: req.body.rating,
                comment: req.body.comment,
                ownerId: req.user._id,
                businessId: business._id,
            });
            newOpinion.save((err, opinion) => {
                if (err) {
                    return res.redirect("/");
                } else {
                    User.findByIdAndUpdate(req.params.id, { $push: { opinions: opinion } }, { new: true }, (err, user) => {
                        return res.redirect("/") //dodac render
                    });
                };
            });
        }); // ZREFAKTORYZOWAC TO BO FIND ONE NIE ZWRACA DOKUMENTU, DLATEGO POWIELAM TEN SAM KOD
    } else {
        return res.redirect("/"); // wyswietl error ze nie jest z firmy
    }
};

module.exports = {
    getUser,
    addOpinion,
    editProfileView,
    editProfile
}