const Business = require("../models/Business");
const User = require("../models/User");
const Opinion = require("../models/OpinionForBusiness");
const OpinionForUser = require("../models/OpinionForUser");
const Service = require("../models/Service");
const ObjectId = require("mongoose").Types.ObjectId;

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

const addWorker = (req, res) => {
  User.findOne({ invCode: req.body.code }, (err, user) => {
    if (user == null) {
      Business.findById(req.params.id, (err, business) => {
        const message = "Brak takiego uzytkownika.";
        const currentUser = req.user;
        return homeView(req, res);;
      });
    } else {
      if (user.role != "Owner" && user.role != "Worker") {
        Business.findOne({ "owner._id": req.user._id }, (err, business) => {
          User.findByIdAndUpdate(
            user._id,
            { $set: { role: "Worker" } },
            { new: true },
            (err, updateUser) => {
              console.log("ZMIENIAM ROLE");
            }
          );
          if (business.workers != null) {
            Business.findOneAndUpdate(
              { "ownerId": req.user._id },
              { $push: { workers: user.id } },
              { new: true },
              (err, business) => {
                const message = "Pracownik dodany do firmy.";
                return homeView(req, res, "", message);
              }
            );
          } else {
            Business.findOneAndUpdate(
              { "ownerId": req.user._id },
              { $set: { workers: user.id } },
              { new: true },
              (err, business) => {
                const message = "Pracownik dodany do firmy.";
                return homeView(req, res, "", message);
              }
            );
          }
        });
      } else {
        const message = "Podany użytkownik jest już pracownikiem lub właścielem.";
        Business.findById(req.params.id, (err, business) => {
          return homeView(req, res, "", message);
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
        return res.render("business", { user: req.user, business, message });
      }
      Business.findByIdAndUpdate(
        req.params.idBusiness,
        { $pull: { workers: user._id } },
        { new: true },
        (err, business) => {
          if (err) {
            const message = "Brak uzytkownika do usuniecia.";
            return homeView(req, res, "", message);
          }
          console.log(business.workers);
          const message = "Uzytkownik usunięty.";
          return homeView(req, res, "", message);
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
      return homeView(req, res, "", message);
    }
    const update = {
      $push: { services: service.id },
    };
    Business.findByIdAndUpdate(businessId, update, { new: true }, (err, business) => {
      if (err) {
        const message = "Błąd podczas dodawania serwisu do firmy!";
        return homeView(req, res, "", message);
      }
      const message = "Serwis dodany.";
      return homeView(req, res, "", message);
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
        return homeView(req, res, "", message);
      }
      Service.findOneAndDelete({ _id: req.params.id }, { new: true }, (err, service) => {
        const message = "Serwis usuniety.";
        return homeView(req, res, "", message);
      });
    }
  );
};

const editService = (req, res) => {
  console.log(req.params.idService, req.body.name, req.body.description);
  Service.findByIdAndUpdate(req.params.idService, { name: req.body.name, description: req.body.description, price: req.body.price }, { new: true }, (err, service) => {
    if (err) {
      const message = "Błąd w trakcie edytowania serwisu.";
      return homeView(req, res, "", message);
    }
    const message = "Serwis edytowany."
    return homeView(req, res, "", message);
  });
};

const editProfile = (req, res) => {
  let update;
  if (req.body.name) {
    update = { name: req.body.name };
  } else if (req.body.description) {
    update = { description: req.body.description };
  } else if (req.body.phone) {
    var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{3})$/; // validation of phone
    if (!re.test(req.body.phone)) {
      const message = "Podaj prawidłowy numer telefonu.";
      return homeView(req, res, "", message);
    }
    update = { phone: req.body.phone };
  } else if (req.body.address) {
    update = { address: req.body.address };
  } else {
    const message = "Nie podano parametrów do edycji.";
    return homeView(req, res, "", message);
  }

  Business.findByIdAndUpdate(req.params.id, update, { new: true }, (err, business) => {
    if (err) return homeView(req, res, "", "Błąd podczas edycji.")
    return homeView(req, res, "", "Edycja pomyślna.")
  });
}

const removeBusiness = (req, res) => {
  Business.findById(req.params.id, (err, business) => {
    if (err) return homeView(req, res, "", "Coś poszło nie tak");


    const workersIds = business.workers;
    User.findByIdAndUpdate(req.user._id, { role: "User" }, (err, userOwner) => {
      if (err) return homeView(req, res, "", "Coś poszło nie tak");
      User.updateMany({ _id: { $in: workersIds } }, { role: "User" }, { multi: true }, (err, users) => {
        if (err) return homeView(req, res, "", "Coś poszło nie tak");
        const opinionsIds = business.opinions;
        Opinion.deleteMany({ _id: { $in: opinionsIds } }, (err, opinions) => {
          if (err) return homeView(req, res, "", "Coś poszło nie tak");
          const servicesIds = business.services;
          Service.deleteMany({ _id: { $in: servicesIds } }, (err, services) => {
            if (err) return homeView(req, res, "", "Coś poszło nie tak");
            OpinionForUser.find({ businessId: business._id }).select("_id").exec((err, ids) => { // wyszukanie id opinii do usuniecia
              if (err) return homeView(req, res, "", "Coś poszło nie tak");
              let listOfIds = [];
              ids.forEach(opinion => { listOfIds.push(opinion._id) }); // lista z id opinii
              User.updateMany({ opinions: { $in: listOfIds } }, { $pull: { opinions: { $in: listOfIds } } }, { new: true }, (err, foreignUsers) => { //usuniecie opinii u uzytkownikow
                if (err) return homeView(req, res, "", "Coś poszło nie tak");
                OpinionForUser.deleteMany({ businessId: business._id }, (err, foreignOpinions => { // usuniecie obcych opinii
                  if (err) return homeView(req, res, "", "Coś poszło nie tak");
                  Business.findByIdAndRemove(req.params.id, { new: true }, (err, business) => {
                    return res.render("home", { user: req.user, business: false, message: "Poprawnie usunięto firme." });
                  });
                }));
              });
            });
          });
        });
      });
    });
  });
  // usuwanie wizyt
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
