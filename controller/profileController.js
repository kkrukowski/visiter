const User = require("../models/User");
const Opinion = require("../models/OpinionForUser");
const Business = require("../models/Business");
const OpinionForBusiness = require("../models/OpinionForBusiness");
const mongoose = require("mongoose");

const editProfile = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (req.user._id == req.params.id) {
            if (req.body.name && req.body.surname)
                update = { name: req.body.name, surname: req.body.surname };
            else if (req.body.email)
                update = { email: req.body.email };
            else if (req.body.phone) {
                var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{3})$/; //validation of phone
                if (!re.test(req.body.phone)) {
                    const message = "Podaj prawidłowy numer telefonu.";
                    const opinions = await Opinion.find({ "_id": { $in: req.user.opinions } }).populate(["ownerId", "businessId"]).exec();
                    return res.render("profile", {
                        currentUser: req.user,
                        user: req.user,
                        opinions,
                        message: message,
                        isSameUser: req.params.id == req.user._id ? true : false
                    });
                }
                update = { phone: req.body.phone };
            } else if (req.body.country)
                update = { country: req.body.country };
            else if (req.body.city)
                update = { city: req.body.city };

            const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, session }).exec();
            const opinions = await Opinion.find({ "_id": { $in: user.opinions } }).populate(["ownerId", "businessId"]).exec();
            await session.commitTransaction();
            return res.render("profile", {
                currentUser: req.user,
                user,
                opinions: opinions,
                message: "",
                isSameUser: req.params.id == req.user._id ? true : false
            });
        }
    } catch (err) {
        console.log(err);
        const user = await User.findById(req.params.id).exec();
        const opinions = await Opinion.find({ "_id": { $in: user.opinions } }, { new: true }).populate(["ownerId", "businessId"]).exec();
        const message = "Edycja niepomyślna.";
        await session.abortTransaction();
        return res.render("profile", {
            currentUser: req.user,
            user,
            opinions,
            message,
            isSameUser: req.params.id == req.user._id ? true : false
        });
    } finally {
        session.endSession();
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("opinions").exec();
        const opinions = await Opinion.find({ "_id": { $in: user.opinions } }).populate(["ownerId", "businessId"]).exec();
        return res.render("profile", {
            currentUser: req.user,
            user,
            opinions: opinions,
            message: "",
            isSameUser: req.params.id == req.user._id ? true : false
        });
    } catch (err) {
        const user = await User.findById(req.user._id).exec();
        const message = "Użytkownik nie znaleziony.";
        return res.render("home", {
            user,
            business: req.user.role == "Owner" ? await Business.findOne({ ownerId: req.user._id }).exec() : await Business.findOne({ workers: req.user._id }).exec(),
            //^ wyszukaj dla ownera, jesli nie to dla pracownika, jesli klient nie jest pracownikiem zwroci false.
            message: message
        });
    }
};

const addOpinion = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        correctName = req.user.name + " " + req.user.surname;
        let business = undefined;
        if (req.user.role == "Worker") { //znalezienie firmy przez pracownikach
            business = await Business.findOne({ workers: req.user._id }).exec();
        } else if (req.user.role == "Owner") { // znalezienie firmy przez wlasciciela
            business = await Business.findOne({ ownerId: req.user._id }).exec();
        } else { // uzytkownik jest klientem, klient klientowi nie moze wystawic opinii
            const user = await User.findById(req.params.id).exec();
            const opinions = await Opinion.find({ "_id": { $in: user.opinions } }, { new: true }).populate(["ownerId", "businessId"]).exec();
            const message = "Nie jesteś pracownikiem lub właścicielem aby wystawić opinie.";
            return res.render("profile", {
                currentUser: req.user,
                user,
                opinions,
                message,
                isSameUser: req.params.id == req.user._id ? true : false
            });
        }
        const newOpinion = new Opinion({
            rating: req.body.rating,
            comment: req.body.comment,
            ownerId: req.user._id,
            businessId: business._id
        });
        newOpinion.save();
        await User.findByIdAndUpdate(req.params.id, { $push: { opinions: newOpinion } }, { new: true, session }).exec();
        await session.commitTransaction();
        return getUser(req, res);
    } catch (err) {
        const user = await User.findById(req.params.id).exec();
        const opinions = await Opinion.find({ "_id": { $in: user.opinions } }, { new: true }).populate(["ownerId", "businessId"]).exec();
        const message = "Opinia nie została dodana.";
        await session.abortTransaction();
        return res.render("profile", {
            currentUser: req.user,
            user,
            opinions,
            message,
            isSameUser: req.params.id == req.user._id ? true : false
        });
    } finally {
        await session.endSession();
    }
};

const removeOpinion = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await User.findByIdAndUpdate(req.params.id, { $pull: { opinions: req.params.idOpinion } }, { new: true, session }).exec();
        await Opinion.findByIdAndDelete(req.params.idOpinion, { new: true, session }).exec();
        await session.commitTransaction();
        return getUser(req, res);
    } catch (err) {
        const user = await User.findById(req.params.id).exec();
        const opinions = await Opinion.find({ "_id": { $in: user.opinions } }, { new: true }).populate(["ownerId", "businessId"]).exec();
        const message = "Opinia nie została usunięta.";
        await session.abortTransaction();
        return res.render("profile", {
            currentUser: req.user,
            user,
            opinions,
            message,
            isSameUser: req.params.id == req.user._id ? true : false
        });
    } finally {
        await session.endSession();
    }
};

const removeProfile = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (req.params.id == req.user._id) {
            if (req.user.role == "User") { // dla uzytkownika
                const opinionIds = await OpinionForBusiness.find({ ownerId: req.params.id }).select("_id").exec();
                let listOfIds = [];
                opinionIds.forEach(opinionId => {
                    listOfIds.push(opinionId._id);
                });
                const opinionIdsInUsers = await Opinion.find({ ownerId: req.params.id }).select("_id").exec();
                let listOfUserIds = [];
                opinionIdsInUsers.forEach(opinionId => {
                    listOfUserIds.push(opinionId._id);
                });
                const user = await User.findById(req.params.id).exec();
                const opinions = user.opinions;
                await Business.updateMany({ opinions: { $in: listOfIds } }, { $pull: { opinions: { $in: listOfIds } } }, { session }).exec();
                await User.findByIdAndDelete(req.params.id, { session }).exec();
                await User.updateMany({ opinions: { $in: listOfUserIds } }, { $pull: { opinions: { $in: listOfUserIds } } }, { session }).exec()
                await OpinionForBusiness.deleteMany({ ownerId: req.params.id }, { session }).exec();
                await Opinion.deleteMany({ ownerId: req.params.id }, { session }).exec();
                await Opinion.deleteMany({ _id: { $in: opinions } }, { session }).exec();
                await session.commitTransaction();
                req.logOut(err => {
                    if (err) return next(err);
                    const message = "Konto usunięte.";
                    return res.render("login", { message: message });
                });
            }
            else if (req.user.role == "Owner") { // dla wlasciciela
                Business.findOne({ ownerId: req.user._id }, (err, business) => {
                    if (err) return res.render("home", { user: req.user, business, message: "Coś poszło nie tak." });
                    const message = "Aby usunąć konto, usuń najpierw firmę."
                    return res.render("home", { user: req.user, business, message: message });
                });
            }
            else { // dla workera
                const opinionIds = await OpinionForBusiness.find({ ownerId: req.params.id }).select("_id").exec();
                let listOfIds = [];
                opinionIds.forEach(opinionId => {
                    listOfIds.push(opinionId._id);
                });
                const opinionIdsInUsers = await Opinion.find({ ownerId: req.params.id }).select("_id").exec();
                let listOfUserIds = [];
                opinionIdsInUsers.forEach(opinionId => {
                    listOfUserIds.push(opinionId._id);
                });
                const user = await User.findById(req.params.id).exec();
                const opinions = user.opinions;
                console.log(opinions);
                await Business.findOneAndUpdate({ workers: req.params.id }, { $pull: { workers: req.params.id } }, { session }).exec()
                await Business.updateMany({ opinions: { $in: listOfIds } }, { $pull: { opinions: { $in: listOfIds } } }, { session }).exec();
                await User.findByIdAndDelete(req.params.id, { session }).exec();
                await User.updateMany({ opinions: { $in: listOfUserIds } }, { $pull: { opinions: { $in: listOfUserIds } } }, { session }).exec()
                await OpinionForBusiness.deleteMany({ ownerId: req.params.id }, { session }).exec();
                await Opinion.deleteMany({ ownerId: req.params.id }, { session }).exec();
                await Opinion.deleteMany({ _id: { $in: opinions } }, { session }).exec();
                await session.commitTransaction();
                req.logOut(err => {
                    if (err) return next(err);
                    const message = "Konto usunięte.";
                    return res.render("login", { message: message });
                });
            }
        };
    } catch (err) {
        console.log(err)
        const user = await User.findById(req.user._id).exec();
        const message = "Coś poszło nie tak.";
        await session.abortTransaction();
        return res.render("home", {
            user,
            business: req.user.role == "Owner" ? await Business.findOne({ ownerId: req.user._id }).exec() : await Business.findOne({ workers: req.user._id }).exec(),            //^ wyszukaj dla ownera, jesli nie to dla pracownika, jesli klient nie jest pracownikiem zwroci false.
            message: message
        });
    } finally {
        await session.endSession();
    }
};

module.exports = {
    getUser,
    addOpinion,
    editProfile,
    removeOpinion,
    removeProfile
}