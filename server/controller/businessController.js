const Business = require("../models/Business");
const User = require("../models/User");
const Opinion = require("../models/OpinionForBusiness");
const Service = require("../models/Service");
const ObjectId = require("mongoose").Types.ObjectId;

const registerView = (req, res, err, message = "") => {
  if (req.user.role == "Owner") {
    res.redirect("/business");
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
    });
    createBusiness.save();
    res.redirect("/");
  } catch {
    res.redirect("/business/register");
  }
};

const refreshRole = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    { role: "User" },
    function (error, result) {
      if (error) {
        console.log("False");
      } else {
        console.log("True");
      }
    },
    { new: true }
  );

  Business.findOneAndDelete({ "owner.id": req.user._id });
  res.redirect("/");
};

const homeView = (req, res) => {
  if (req.user.role == "Owner") {
    Business.findOne({ "owner._id": req.user._id }, (err, business) => {
      return res.render("business", { business, message: "" });
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
        return res.render("searchBusiness", {
          user: req.user,
          businesses: businesses.docs,
          searchData: { searchName, searchLocation },
          paginationData: {
            totalPages: businesses.totalPages,
            totalDocs: businesses.totalDocs,
            currentPage: businesses.page,
            hasPrevPage: businesses.hasPrevPage,
            hasNextPage: businesses.hasNextPage,
          },
        });
      })
      .catch((err) => {
        return res.render("searchBusiness");
      });
  } else {
    Business.paginate({}, { offset, limit })
      .then((businesses) => {
        return res.render("searchBusiness", {
          user: req.user,
          businesses: businesses.docs,
          searchData: { searchName: null, searchLocation: null },
          paginationData: {
            totalPages: businesses.totalPages,
            totalDocs: businesses.totalDocs,
            currentPage: businesses.page,
            hasPrevPage: businesses.hasPrevPage,
            hasNextPage: businesses.hasNextPage,
          },
        });
      })
      .catch((err) => {
        return res.render("searchBusiness");
      });
  }
};

const getBusiness = (req, res) => {
  Business.findById(req.params.id, (err, business) => {
    return res.render("specificBusiness", {
      user: req.user,
      business: business,
      Users: User,
    });
  });
};

const addOpinion = (req, res) => {
  correctName = req.user.name + " " + req.user.surname;
  const newOpinion = new Opinion({
    rating: req.body.rating,
    comment: req.body.comment,
    ownerId: req.user._id
  });

  newOpinion.save((err, service) => {
    if (err) {
      const business = Business.findById(req.params.id);
      const message = "Błąd w trakcie dodawania opinii.";
      return res.render("specificBusiness", { user: req.user, business: business, Users: User, message });
    } else {
      Business.findByIdAndUpdate(req.params.id, { $push: { opinions: service.id } }, { new: true }, (err, business) => {
        const message = "Dodano opinie.";
        return res.render("specificBusiness", { user: req.user, business: business, Users: User, message });
      });
    };
  });
};

const addWorker = (req, res) => {
  User.findOne({ invCode: req.body.code }, (err, user) => {
    if (user == null) {
      Business.findById(req.params.id, (err, business) => {
        const message = "Brak takiego uzytkownika.";
        const currentUser = req.user;
        return res.render("business", { currentUser, business, message });
      });
    } else {
      if (user.role != "Owner" && user.role != "Worker") {
        Business.findOne({ "owner._id": req.user._id }, (err, business) => {
          User.findByIdAndUpdate(
            user._id,
            { $set: { role: "Worker" } },
            { new: true },
            (err, updateUser) => {
              console.log(updateUser);
            }
          );
          if (business.workers != null) {
            Business.findOneAndUpdate(
              { "owner._id": req.user._id },
              { $push: { workers: user.id } },
              { new: true },
              (err, business) => {
                const message = "Pracownik dodany do firmy.";
                const currentUser = req.user;
                return res.render("business", {
                  currentUser,
                  business,
                  message,
                });
              }
            );
          }
        });
      } else {
        const message =
          "Podany użytkownik jest już pracownikiem lub właścielem.";
        const currentUser = req.user;
        Business.findById(req.params.id, (err, business) => {
          return res.render("business", { currentUser, business, message });
        });
      }
    }
  });
};
const removeWorker = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.params.id },
    { role: "User" },
    { new: true },
    (err, user) => {
      if (err) {
        const message = "Brak uzytkownika.";
        const currentUser = req.user;
        return res.render("business", { currentUser, business, message }); //dodac message o bledzie
      }
      Business.findByIdAndUpdate(
        req.params.idBusiness,
        { $pull: { workers: user._id } },
        { new: true },
        (err, business) => {
          if (err) {
            const message = "Brak uzytkownika do usuniecia.";
            const currentUser = req.user;
            return res.render("business", { currentUser, business, message }); //dodac message o bledzie
          }
          console.log(business.workers);
          const message = "Uzytkownik usunięty.";
          const currentUser = req.user;
          return res.render("business", { currentUser, business, message });
        }
      );
    }
  );
};

const addService = (req, res) => {
  const businessId = req.params.id;
  const newService = new Service({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    duration: req.body.duration,
    businessId: businessId,
  });

  newService.save((err, service) => {
    if (err) {
      const business = Business.findById(businessId);
      const message = "Błąd w trakcie dodawania serwisu.";
      const currentUser = req.user;
      return res.render("business", { currentUser, business, message });
    }
    const update = {
      $push: { services: service.id },
    };
    Business.findByIdAndUpdate(businessId, update, { new: true }, (err, business) => {
      const currentUser = req.user;
      if (err) {
        const message = "Błąd podczas dodawania serwisu do firmy!";
        return res.render("business", { currentUser, business, message });
      }
      const message = "Serwis dodany.";
      return res.render("business", { currentUser, business, message });
    });
  });
};

const removeService = (req, res) => {
  Business.findOneAndUpdate(
    { _id: req.params.idBusiness },
    { $pull: { services: req.params.id } },
    { new: true },
    (err, business) => {
      if (err) {
        const message = "Błąd w trakcie usuwania serwisu.";
        const currentUser = req.user;
        return res.render("business", { currentUser, business, message });
      }
      const message = "Serwis usuniety.";
      const currentUser = req.user;
      return res.render("business", { currentUser, business, message });
    }
    // dodac usuwanie z bazy Services
  );
};

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
  removeService,
};
