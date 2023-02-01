const Business = require("../models/Business");
const User = require("../models/User");
const Opinion = require("../models/OpinionForBusiness");
const Service = require("../models/Service");

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

const getAllBusiness = async (req, res) => {
  const searchName = req.query.name;
  const searchLocation = req.query.location;
  if (searchName != null && searchLocation != null) {
    Business.find(
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
      function (err, business) {
        if (err) {
          res.send(err);
          return res.render("searchBusiness");
        }
        return res.render("searchBusiness", {
          user: req.user,
          businesses: business,
          searchData: { searchName, searchLocation },
        });
      }
    );
  } else if (searchName != null && searchLocation == null) {
    Business.find(
      {
        $or: [
          { name: { $regex: searchName } },
          { description: { $regex: searchLocation } },
        ],
      },
      function (err, business) {
        if (err) {
          res.send(err);
          return res.render("searchBusiness");
        }
        return res.render("searchBusiness", {
          user: req.user,
          businesses: business,
          searchData: { searchName, searchLocation: null },
        });
      }
    );
  } else if (searchName == null && searchLocation != null) {
    Business.find(
      { address: { $regex: searchLocation } },
      function (err, business) {
        if (err) {
          res.send(err);
          return res.render("searchBusiness");
        }
        return res.render("searchBusiness", {
          businesses: business,
          user: req.user,
          searchData: { searchName: null, searchLocation },
        });
      }
    );
  } else {
    Business.find({}, function (err, business) {
      if (err) {
        res.send(err);
        return res.render("searchBusiness");
      }
      return res.render("searchBusiness", {
        user: req.user,
        businesses: business,
        searchData: { searchName: null, searchLocation: null },
      });
    });
  }
};

const getBusiness = (req, res) => {
  Business.findById(req.params.id, (err, business) => {
    return res.render("specificBusiness", { user: req.user, business: business, Users: User });
  });
};

const addOpinion = (req, res) => {
  correctName = req.user.name + " " + req.user.surname;
  const newOpinion = new Opinion({
    rating: req.body.rating,
    comment: req.body.comment,
    ownerId: req.user._id,
    ownerName: correctName,
  });
  Business.findById(req.params.id, (err, business) => {
    if (business.opinions != null) {
      Business.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { opinions: newOpinion } },
        { new: true },
        (err, business) => {
          return res.render("specificBusiness", { user: req.user, business: business, Users: User });
        }
      );
    } else {
      Business.findByIdAndUpdate(
        req.params.id,
        { $set: { opinions: newOpinion } },
        { new: true },
        (err, business) => {
          return res.render("specificBusiness", { user: req.user, business: business, Users: User });
        }
      );
    }
  });
};
const addWorker = (req, res) => {
  User.findOne({ _id: req.body.id }, (err, user) => {
    if (user === undefined) {
      Business.findById(req.params.id, (err, business) => {
        const message = "Brak takiego uzytkownika.";
        const currentUser = req.user;
        return res.render("business", { currentUser, business, message });
      });
    } else if (user.role != "Owner" && user.role != "Worker") {
      User.findByIdAndUpdate(
        user._id,
        { $set: { role: "Worker" } },
        { new: true },
        (err, updateUser) => {
          console.log(updateUser);
        }
      );
      Business.findOne({ "owner._id": req.user._id }, (err, business) => {
        if (business.workers != null) {
          Business.findOneAndUpdate(
            { "owner._id": req.user._id },
            { $addToSet: { workers: user } },
            { new: true },
            (err, business) => {
              const message = "Pracownik dodany do firmy.";
              const currentUser = req.user;
              return res.render("business", { currentUser, business, message });
            }
          );
        } else {
          Business.findOneAndUpdate(
            { "owner._id": req.user._id },
            { $set: { workers: user } },
            { new: true },
            (err, business) => {
              const message = "Pracownik dodany do firmy.";
              const currentUser = req.user;
              return res.render("business", { currentUser, business, message });
            }
          );
        }
      });
    } else {
      const message = "Podany użytkownik jest już pracownikiem lub właścielem.";
      const currentUser = req.user;
      Business.findById(req.params.id, (err, business) => {
        return res.render("business", { currentUser, business, message });
      });
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
        { $pull: { workers: { _id: user._id } } },
        { new: true },
        (err, business) => {
          if (err) {
            const message = "Brak uzytkownika do usuniecia.";
            const currentUser = req.user;
            return res.render("business", { currentUser, business, message }); //dodac message o bledzie
          }
          const message = "Uzytkownik usunięty.";
          const currentUser = req.user;
          return res.render("business", { currentUser, business, message });
        }
      );
    }
  );
};

const addService = (req, res) => {
  const newService = new Service({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    duration: req.body.duration,
  });
  Business.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { services: newService } },
    { new: true },
    (err, business) => {
      //new zwraca odrazu zupdatowany obiekt
      if (err) {
        const message = "Błąd w trakcie usuwania serwisu.";
        const currentUser = req.user;
        return res.render("business", { currentUser, business, message }); //dodac message o bledzie
      }
      const message = "Serwis dodany.";
      const currentUser = req.user;
      return res.render("business", { currentUser, business, message });
    }
  );
};

const removeService = (req, res) => {
  Business.findOneAndUpdate(
    { _id: req.params.idBusiness },
    { $pull: { services: { _id: req.params.id } } },
    { new: true },
    (err, business) => {
      if (err) {
        const message = "Błąd w trakcie usuwania serwisu.";
        const currentUser = req.user;
        return res.render("business", { currentUser, business, message }); //dodac message o bledzie
      }
      const message = "Serwis usuniety.";
      const currentUser = req.user;
      return res.render("business", { currentUser, business, message });
    }
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
