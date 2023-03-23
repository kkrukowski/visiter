const Business = require("../models/Business");
const User = require("../models/User");
const Opinion = require("../models/OpinionForBusiness");
const OpinionForUser = require("../models/OpinionForUser");
const Service = require("../models/Service");
const mongoose = require("mongoose");

const registerView = (req, res, err, message = "") => {
  if (req.user.role == "Owner") {
    res.redirect("/business"); //tu do zmiany
  }
  res.render("businessRegister", { message: message });
};

const registerBusiness = async (req, res) => {
  correctName =
    req.body.name.charAt(0).toUpperCase() +
    req.body.name.slice(1).toLowerCase();
  correctDesc =
    req.body.description.charAt(0).toUpperCase() +
    req.body.description.slice(1);

  var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{3})$/; //validation of phone
  if (!re.test(req.body.phone)) {
    const message = "Podaj prawidłowy numer telefonu.";
    return registerView(req, res, "", message);
  }

  if (req.body.tags) { // dodawanie tagów
    listOfTags = req.body.tags.split(";");
  } else {
    listOfTags = [];
  }
  User.findOneAndUpdate(
    { _id: req.user._id },
    { role: "Owner" },
    function (error, result) {
      if (error) {
        console.log("False");
      } else {
        console.log("True");
      }
    }
  );

  try {
    const createBusiness = new Business({
      name: correctName,
      description: correctDesc,
      owner: req.user,
      adress: req.body.adress,
      phone: req.body.phone,
      address: req.body.address,
      ownerId: req.user,
      tags: listOfTags
    });
    createBusiness.save();
    res.redirect("/");
  } catch {
    res.redirect("/business/register");
  }
}; // dodac res.rendery, sprawdzanie czy nie jest juz workerem/ownerem

const homeView = (req, res, next = "", message = "") => {
  if (req.user.role == "Owner") {
    Business.findOne({ ownerId: req.user._id }).populate(["ownerId", "workers", "opinions", "services"]).exec((err, business) => {
      const opinionsIds = business.opinions;
      Opinion.find({ "_id": { $in: opinionsIds } }).populate("ownerId").exec(function (err, opinions) {
        return res.render("business", { currentUser: req.user, user: req.user, business, message: message, opinions: opinions })
      });
    });
  } else {
    res.redirect("/business/register");
  }
};


const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getAllBusiness = async (req, res) => {
  const { limit, offset } = getPagination(req.query.page - 1, 3);
  const searchName = req.query.name;
  const searchLocation = req.query.location;
  if (searchName != null && searchLocation != null) {
    Business.paginate(
      {
        $and: [
          {
            $or: [
              { name: { $regex: searchName } },
              { description: { $regex: searchName } },
            ],
          },
          { address: { $regex: searchLocation } },
        ],
      },
      { offset, limit }
    )
      .then((businesses) => {
        Business.find({}).populate("services", "ownerId").exec((err, businessesWithServices) => {
          //console.log(businessesWithServices);
          return res.render("searchBusiness", {
            user: req.user,
            businesses: businessesWithServices,
            searchData: { searchName, searchLocation },
            paginationData: {
              totalPages: businesses.totalPages,
              totalDocs: businesses.totalDocs,
              currentPage: businesses.page,
              hasPrevPage: businesses.hasPrevPage,
              hasNextPage: businesses.hasNextPage,
            },
          });
        });
      })
      .catch((err) => {
        return res.render("searchBusiness");
      });
  } else {
    Business.paginate({}, { offset, limit })
      .then((businesses) => {
        Business.find({}).populate("services").exec((err, businessesWithServices) => {
          //console.log(businessesWithServices);
          return res.render("searchBusiness", {
            user: req.user,
            businesses: businessesWithServices,
            searchData: { searchName: null, searchLocation: null },
            paginationData: {
              totalPages: businesses.totalPages,
              totalDocs: businesses.totalDocs,
              currentPage: businesses.page,
              hasPrevPage: businesses.hasPrevPage,
              hasNextPage: businesses.hasNextPage,
            },
          });
        });
      })
      .catch((err) => {
        return res.render("searchBusiness");
      });
  }
};

const getServicesFromBusiness = (businessesDocs) => {
  let businessesServices = [];
  for (let i = 0; i < businessesDocs.length; i++) {
    const servicesIds = businessesDocs[i].services;
    Service.find({ _id: servicesIds }, (err, servicesData) => {
      if (err) return res.send(err);
      businessesServices.push(servicesData);
      console.log(businessesServices);
    });
  }
  console.log(businessesServices);
  return businessesServices;
};

const getBusiness = (req, res) => {

  Business.findById(req.params.id).populate(["ownerId", "workers", "opinions", "services"]).exec((err, business) => {
    const opinionsIds = business.opinions;
    Opinion.find({ "_id": { $in: opinionsIds } }).populate("ownerId").exec(function (err, opinions) {
      const message = "";
      return res.render("specificBusiness", { currentUser: req.user, user: req.user, business, message: message, opinions: opinions })
    });
  });
};

const addOpinion = (req, res) => {
  const newOpinion = new Opinion({
    rating: req.body.rating,
    comment: req.body.comment,
    ownerId: req.user._id,
  });

  newOpinion.save((err, opinion) => { // DODAC OPINIE DO RENDERU !!!
    if (err) {
      Business.findById(req.params.id).populate(["workers", "opinions"]).exec((err, business) => {
        const message = "Wystąpił błąd podczas dodawania opinii.";
        return res.render("specificBusiness", {
          user: req.user,
          business: business,
          opinions: business.opinions,
          workers: business.workers,
          currentUser: req.user,
          message,
        });
      });
    } else {
      Business.findByIdAndUpdate(
        req.params.id,
        { $push: { opinions: opinion.id } },
        { new: true }
      ).populate(["workers", "opinions"]).exec((err, business) => {
        const message = "Dodano opinie.";
        return res.render("specificBusiness", {
          user: req.user,
          business: business,
          opinions: business.opinions,
          currentUser: req.user,
          workers: business.workers,
          message,
        });
      });
    };
  });
};

const addWorker = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findOne({ invCode: req.body.code }).exec();
    if (user == null) throw new Error("Brak takiego użytkownika!");
    if (user.role != "Owner" && user.role != "Worker") {
      const business = await Business.findOneAndUpdate({ ownerId: req.user._id }, { $push: { workers: user._id } }, { new: true, session })
        .populate(["ownerId", "workers", "opinions", "services"]).exec();
      console.log(business);
      await User.findOneAndUpdate({ _id: user._id }, { role: "Worker" }, { session });
      const opinionIds = business.opinions;
      const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
      await session.commitTransaction();
      return res.render("business", {
        currentUser: req.user,
        user: req.user,
        business,
        message: "Pracownik dodany.",
        opinions: opinions
      });
    } else {
      throw new Error("Użytkownik jest właścicielem lub pracownikiem.");
    }
  } catch (err) {
    console.log("ERR: ", err);
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"]).exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.abortTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: err.message,
      opinions: opinions
    });
  } finally {
    await session.endSession();
  }
};
const removeWorker = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findOneAndUpdate({ _id: req.params.idWorker }, { role: "User" }, { new: true, session }).exec()
    const business = await Business.findByIdAndUpdate(req.params.id, { $pull: { workers: user._id } }, { new: true, session })
      .populate(["ownerId", "workers", "opinions", "services"]).exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.commitTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Pracownik usunięty.",
      opinions: opinions
    });
  } catch (err) {
    console.log("ERR: ", err);
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"]).exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.abortTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Usuwanie niepomyślne.",
      opinions: opinions
    });
  } finally {
    await session.endSession();
  }
};

const addService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const businessId = req.params.id;
    const newService = new Service({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      duration: req.body.duration,
      businessId: businessId,
    });
    newService.save({ session });
    const update = {
      $push: { services: newService.id },
    };
    const business = await Business.findByIdAndUpdate(businessId, update, { new: true, session })
      .populate(["ownerId", "workers", "opinions", "services"]).exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.commitTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Serwis dodany.",
      opinions: opinions
    });
  } catch (err) {
    console.log("ERR: ", err);
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"]).exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.abortTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Dodawanie niepomyślne.",
      opinions: opinions
    });
  } finally {
    await session.endSession();
  }
};

const removeService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Business.findOneAndUpdate({ _id: req.params.id }, { $pull: { services: req.params.id } }, { new: true, session }).exec();
    await Service.findOneAndDelete({ _id: req.params.idService }, { new: true, session }).exec();
    await session.commitTransaction();
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"]).exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.commitTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Serwis usunięty.",
      opinions: opinions
    });
  } catch (err) {
    console.log("ERR: ", err);
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"]).exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.abortTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Usuwanie niepomyślne.",
      opinions: opinions
    });
  } finally {
    await session.endSession();
  }
};

const editService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Service.findByIdAndUpdate(
      req.params.idService,
      { name: req.body.name, description: req.body.description, price: req.body.price },
      { new: true, session }).exec();
    const business = await Business.findById(req.params.id, { new: true })
      .populate(["ownerId", "workers", "opinions", "services"]).exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.commitTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Edycja pomyślna.",
      opinions: opinions
    });
  } catch (err) {
    console.log("ERR: ", err);
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"]).exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.abortTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Edycja niepomyślna.",
      opinions: opinions
    });
  } finally {
    await session.endSession();
  }
};

const editProfile = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let update;
    if (req.body.name)
      update = { name: req.body.name };
    else if (req.body.description)
      update = { description: req.body.description };
    else if (req.body.phone) {
      var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{3})$/; // validation of phone
      if (!re.test(req.body.phone)) {
        throw new Error("Nieprawidłowy numer telefonu.");
      }
      update = { phone: req.body.phone };
    } else if (req.body.address)
      update = { address: req.body.address };
    else {
      throw new Error("Brak parametrów.");
    }
    const business = await Business.findByIdAndUpdate(req.params.id, update, { new: true, session })
      .populate(["ownerId", "workers", "opinions", "services"]).exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.commitTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Edycja pomyślna.",
      opinions: opinions
    });
  } catch (err) {
    console.log("ERR: ", err);
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"]).exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.abortTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Edycja niepomyślna.",
      opinions: opinions
    });
  } finally {
    await session.endSession();
  }
}

const removeBusiness = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const business = await Business.findById(req.params.id).exec();
    const workersIds = business.workers;
    const opinionsIds = business.opinions;
    const servicesIds = business.services;
    await User.findByIdAndUpdate(req.user._id, { role: "User" }, { session }).exec();
    await User.updateMany({ _id: { $in: workersIds } }, { role: "User" }, { session }).exec();
    await Opinion.deleteMany({ _id: { $in: opinionsIds } }, { session }).exec(); // usuwanie opinii usuwanej firmy
    const opinionsToPull = await OpinionForUser.find({ businessId: business._id }).select("_id").exec();
    await OpinionForUser.deleteMany({ businessId: business._id }, { session }).exec(); // usuwanie opinii wystawionych klientom
    let listOfIds = [];
    opinionsToPull.forEach(opinion => { listOfIds.push(opinion._id) }); // id usunietych opinii
    console.log(listOfIds);
    await User.updateMany({ opinions: { $in: listOfIds } }, { $pull: { opinions: { $in: listOfIds } } }, { session }).exec(); // usuniecie opinii z modelu uzytkownikow 
    await Service.deleteMany({ _id: { $in: servicesIds } }, { session }).exec();
    await Business.findByIdAndRemove(req.params.id, { session }).exec();
    await session.commitTransaction();
    return res.render("home", {
      user: req.user,
      business: false,
      message: "Poprawnie usunięto firme."
    });
  } catch (err) {
    console.log("ERROR: ", err);
    await session.abortTransaction();
    return res.render("home", {
      user: req.user,
      business: req.user.role == "Owner" ? await Business.find({ ownerId: req.user._id }).exec() : await Business.find({ workers: req.user._id }).exec(),
      //^ wyszukaj dla ownera, jesli nie to dla pracownika, jesli klient nie jest pracownikiem zwroci false.
      message: "Coś poszło nie tak."
    });
  } finally {
    await session.endSession();
  }
};


module.exports = {
  registerView,
  registerBusiness,
  homeView,
  getAllBusiness,
  getBusiness,
  addOpinion,
  addWorker,
  removeWorker,
  addService,
  removeService,
  editService,
  editProfile,
  removeBusiness
};
