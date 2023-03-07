const User = require("../models/User");
const Opinion = require("../models/OpinionForUser");
const Business = require("../models/Business");

const editProfile = (req, res) => {
    if (req.body.name && req.body.surname) {
        User.findByIdAndUpdate(req.params.id, { name: req.body.name, surname: req.body.surname }, { new: true }, (err, user) => {
            if (err) {
                return res.redirect("/")
            }
            else {
                const opinionsIds = user.opinions;
                Opinion.find({ "_id": { $in: opinionsIds } }).populate(["ownerId", "businessId"]).exec(function (err, opinions) {
                    if (err) return res.redirect("/")
                    return res.render("profile", {
                        currentUser: req.user,
                        user: user,
                        opinions,
                        message: "Edycja pomyślna",
                        isSameUser: req.params.id == req.user._id ? true : false
                    });
                });
            }
        });
    } else if (req.body.email) {
        User.findByIdAndUpdate(req.params.id, { email: req.body.email }, { new: true }, (err, user) => {
            if (err) {
                return res.redirect("/")
            }
            else {
                const opinionsIds = user.opinions;
                Opinion.find({ "_id": { $in: opinionsIds } }).populate(["ownerId", "businessId"]).exec(function (err, opinions) {
                    if (err) return res.redirect("/")
                    return res.render("profile", {
                        currentUser: req.user,
                        user: user,
                        opinions,
                        message: "Edycja pomyślna",
                        isSameUser: req.params.id == req.user._id ? true : false
                    });
                });
            }
        });
    } else if (req.body.phone) {
        var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{3})$/; //validation of phone
        if (!re.test(req.body.phone)) {
            const message = "Podaj prawidłowy numer telefonu.";
            const user = req.user;
            const opinionsIds = user.opinions;
            Opinion.find({ "_id": { $in: opinionsIds } }).populate(["ownerId", "businessId"]).exec(function (err, opinions) {
                if (err) return res.redirect("/")
                return res.render("profile", {
                    currentUser: req.user,
                    user: user,
                    opinions,
                    message: "Edycja pomyślna",
                    isSameUser: req.params.id == req.user._id ? true : false
                });
            });
        }
        User.findByIdAndUpdate(req.params.id, { phone: req.body.phone }, { new: true }, (err, user) => {
            if (err) {
                return res.redirect("/")
            }
            else {
                const opinionsIds = user.opinions;
                Opinion.find({ "_id": { $in: opinionsIds } }).populate(["ownerId", "businessId"]).exec(function (err, opinions) {
                    if (err) return res.redirect("/")
                    return res.render("profile", {
                        currentUser: req.user,
                        user: user,
                        opinions,
                        message: "Edycja pomyślna",
                        isSameUser: req.params.id == req.user._id ? true : false
                    });
                });
            }
        });
    } else if (req.body.country) {
        User.findByIdAndUpdate(req.params.id, { country: req.body.country }, { new: true }, (err, user) => {
            if (err) {
                return res.redirect("/")
            }
            else {
                const opinionsIds = user.opinions;
                Opinion.find({ "_id": { $in: opinionsIds } }).populate(["ownerId", "businessId"]).exec(function (err, opinions) {
                    if (err) return res.redirect("/")
                    return res.render("profile", {
                        currentUser: req.user,
                        user: user,
                        opinions,
                        message: "Edycja pomyślna",
                        isSameUser: req.params.id == req.user._id ? true : false
                    });
                });
            }
        });
    } else if (req.body.city) {
        User.findByIdAndUpdate(req.params.id, { city: req.body.city }, { new: true }, (err, user) => {
            if (err) {
                return res.redirect("/")
            }
            else {
                const opinionsIds = user.opinions;
                Opinion.find({ "_id": { $in: opinionsIds } }).populate(["ownerId", "businessId"]).exec(function (err, opinions) {
                    if (err) return res.redirect("/")
                    return res.render("profile", {
                        currentUser: req.user,
                        user: user,
                        opinions,
                        message: "",
                        isSameUser: req.params.id == req.user._id ? true : false
                    });
                });
            }
        });
    }
};

const getUser = (req, res) => {
    User.findById(req.params.id, (err, user) => {
        const opinionsIds = user.opinions;
        Opinion.find({ "_id": { $in: opinionsIds } }).populate(["ownerId", "businessId"]).exec(function (err, opinions) {
            if (err) return res.redirect("/")
            return res.render("profile", {
                currentUser: req.user,
                user: user,
                opinions,
                message: "",
                isSameUser: req.params.id == req.user._id ? true : false
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
                    return res.redirect("/") //dodac render
                } else {
                    User.findByIdAndUpdate(req.params.id, { $push: { opinions: opinion } }, { new: true }, (err, user) => {
                        return res.render("")
                    });
                };
            });
        });
    } else if (req.user.role == "Owner") {
        Business.findOne({ ownerId: req.user._id }, (err, business) => {
            const newOpinion = new Opinion({
                rating: req.body.rating,
                comment: req.body.comment,
                ownerId: req.user._id,
                businessId: business._id,
            });
            newOpinion.save((err, opinion) => {
                if (err) {
                    return getUser(req, res);
                } else {
                    User.findByIdAndUpdate(req.params.id, { $push: { opinions: opinion } }, { new: true }, (err, user) => {
                        return getUser(req, res);
                    });
                };
            });
        });
    } else {
        return res.render("home", { user: req.user, message: "Nie jesteś pracownikiem aby wystawić opinie." }); // wyswietl error ze nie jest z firmy
    }
};

const removeOpinion = (req, res) => {
    User.findByIdAndUpdate(req.params.id, { $pull: { opinions: req.params.idOpinion } }, { new: true }, (err, user) => {
        if (err) return getUser(req, res);
        Opinion.findByIdAndDelete(req.params.idOpinion, { new: true }, (err, opinion) => {
            return getUser(req, res);
        });
    });
};

const removeProfile = (req, res) => {
    if (req.params.id == req.user._id) {
        if (req.user.role == "User") {
            User.findByIdAndDelete(req.params.id, { new: true }, (err, user) => {
                if (err) return res.render("home"); //dodac message o bledzie
                const opinions = user.opinions;
                Opinion.findByIdAndDelete(opinions, (err, opinions) => {
                    req.logOut(err => {
                        if (err) return next(err);
                        const message = "Konto usunięte.";
                        return res.render("login", { message: message });
                    });
                });
            });
        }
        else if (req.user.role == "Owner") {
            Business.findOne({ owner: req.user._id }, (err, business) => {
                if (err) return res.render("home", { user: req.user, message: "Coś poszło nie tak." });
                const message = "Aby usunąć konto, usuń najpierw firmę."
                return res.render("home", { user: req.user, business, message: message });
            });
        }
        else {
            Business.findOneAndUpdate({ workers: req.params.id }, { $pull: { workers: req.params.id } }, (err, business) => {
                if (err) res.render("home", { business, user, message: "Coś poszło nie tak." })
                User.findByIdAndDelete(req.params.id, { new: true }, (err, user) => {
                    if (err) return res.render("home", { business, user, message: "Coś poszło nie tak." });
                    const opinions = user.opinions;
                    Opinion.findByIdAndDelete(opinions, (err, opinions) => {
                        req.logOut(err => {
                            if (err) return next(err);
                            const message = "Konto usunięte.";
                            return res.render("login", { message: message });
                        });
                    });
                });
            });
        }
    };
};

module.exports = {
    getUser,
    addOpinion,
    editProfile,
    removeOpinion,
    removeProfile
}