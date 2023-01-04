const Business = require("../models/Business");
const User = require("../models/User");
const Opinion = require("../models/OpinionForBusiness");
const Service = require("../models/Service");


const registerView = (req, res, err, message = "") => {
    if (req.user.role == "Owner") {
        console.log("Jestes ownerem, nie mozesz rejestrowac firmy")
        res.redirect("/business")
    }
    res.render("businessRegister", { message: message });
}

const registerBusiness = async (req, res) => {
    correctName =
        req.body.name.charAt(0).toUpperCase() +
        req.body.name.slice(1).toLowerCase();
    correctDesc =
        req.body.description.charAt(0).toUpperCase() +
        req.body.description.slice(1);

    var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{3})$/; //validation of phone
    if (!re.test(req.body.phone)) {
        const message = "Podaj prawidłowy numer telefonu."
        return registerView(req, res, "", message)
    }

    User.findOneAndUpdate({ _id: req.user._id }, { role: "Owner" }, function (error, result) {
        if (error) {
            console.log("False")
        }
        else {
            console.log("True")
        }
    });

    try {
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

const refreshRole = (req, res) => {
    console.log(req.user)
    User.findOneAndUpdate({ _id: req.user._id }, { role: "User" }, function (error, result) {
        if (error) {
            console.log("False")
        }
        else {
            console.log("True")
        }
    }, { new: true })

    Business.findOneAndDelete({ 'owner.id': req.user._id });
    res.redirect("/");
}

const homeView = (req, res) => {
    if (req.user.role == "Owner") {
        Business.findOne({ 'owner._id': req.user._id }, (err, business) => {
            console.log("Jestes ownerem, dostep mozliwy");
            console.log(business);
            return res.render("business", { business });
        });
    }
    else {
        res.redirect("/business/register");
    }
}

const getAllBusiness = (req, res) => {
    Business.find({}, function (err, business) {
        if (err) {
            return res.render("searchBusiness");
        }
        return res.render("searchBusiness", { businesses: business })
    })
}

const getBusiness = (req, res) => {
    Business.findById(req.params.id, (err, business) => {
        return res.render("specificBusiness", { business: business, Users: User })
    })
}

const addOpinion = (req, res) => {
    correctName = req.user.username + " " + req.user.secondname;
    const newOpinion = new Opinion({
        rating: req.body.rating,
        comment: req.body.comment,
        ownerId: req.user._id,
        ownerName: correctName
    })
    console.log(newOpinion)
    Business.findById(req.params.id, (err, business) => {
        if (business.opinions != null) {
            Business.findByIdAndUpdate(req.params.id, { $addToSet: { opinions: newOpinion } }, (err, business) => {
                console.log(err)
                console.log(business)
                return res.redirect("/")
            });
        }
        else {
            Business.findByIdAndUpdate(req.params.id, { $set: { opinions: newOpinion } }, (err, business) => {
                console.log(err)
                console.log(business)
                return res.redirect("/")
            });
        }
    });
}
const addWorker = (req, res) => {
    User.findOne({ _id: req.body.id }, (err, user) => {
        if (user.role != "Owner" && user.role != "Worker") {
            User.findByIdAndUpdate(user._id, { $set: { role: "Worker" } }, (err, updateUser) => {
                console.log(updateUser);
            });
            Business.findOne({ 'owner._id': req.user._id }, (err, business) => {
                if (business.workers != null) {
                    Business.findOneAndUpdate({ 'owner._id': req.user._id }, { $addToSet: { workers: user } }, (err, business) => {
                        const message = "Pracownik dodany do firmy."
                        console.log(message)
                        return res.render("business", { business })
                    });
                }
                else {
                    Business.findOneAndUpdate({ 'owner._id': req.user._id }, { $set: { workers: user } }, (err, business) => {
                        const message = "Pracownik dodany do firmy."
                        console.log(message)
                        return res.render("business", { business })
                    });
                }
                return res.render("business", { business })
            })
        } else {
            const message = "Podany użytkownik jest już pracownikiem lub właścielem.";
            console.log(message)
            return res.render("business", { business })
        }
    });

}
const removeWorker = (req, res) => {
    console.log(req.params.id);
    User.findOneAndUpdate({ _id: req.params.id }, { role: "User" }, (err, user) => {
        if (err) {
            return res.render("business", { business }) //dodac message o bledzie
        }
        console.log(user);
        console.log(user._id);
        Business.findOneAndUpdate({ _id: req.params.idBusiness }, { $pull: { workers: { _id: user._id } } }, (err, business) => {
            if (err) {
                return res.render("business", { business }) //dodac message o bledzie
            }
            console.log("uzytkownik usuniety")
            return res.render("business", { business })
        });
    });
}

const addService= (req, res) => {
    const newService = {
        
    }
    Business.findOneAndUpdate({_id: req.params.id}, { $addToSet: { services: newService } })
}

const removeService = (req, res) => {

}

module.exports = {
    registerView,
    registerBusiness,
    homeView,
    refreshRole,
    getAllBusiness,
    getBusiness,
    addOpinion,
    addWorker,
    removeWorker,
    addService,
    removeService
}