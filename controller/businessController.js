const Business = require("../models/Business");
const User = require("../models/User");
const Opinion = require("../models/OpinionForBusiness");
const OpinionForUser = require("../models/OpinionForUser");
const Service = require("../models/Service");
const mongoose = require("mongoose");

const registerView = async (req, res) => {
  try {
    if (req.user.role == "User") {
      return res.render("businessRegister", {
        message: "",
        tags: tagsGlobal
      });
    } else {
      throw new Error("Jesteś właścicielem lub pracownikiem.");
    }
  } catch (err) {
    return res.render("home", {
      user: req.user,
      business:
        req.user.role == "Owner"
          ? await Business.findOne({ ownerId: req.user._id }).exec()
          : await Business.findOne({ workers: req.user._id }).exec(),
      message: "Nie można zarejestrować firmy.",
    });
  }
};

const registerBusiness = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const isUserOwner = await Business.find({ "ownerId": req.user._id }).exec();

    if (isUserOwner) throw new Error("Użytkownik jest właścicielem.");

    const correctName =
      req.body.name.charAt(0).toUpperCase() +
      req.body.name.slice(1).toLowerCase();
    const correctDesc =
      req.body.description.charAt(0).toUpperCase() +
      req.body.description.slice(1);
    const re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{3})$/; //validation of phone
    if (!re.test(req.body.phone)) {
      const message = "Podaj prawidłowy numer telefonu.";
      throw new Error(message);
    }
    if (req.body.tags) {
      // dodawanie tagów
      listOfTags = req.body.tags.split(";");
    } else {
      listOfTags = [];
    }
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      role: "Owner",
    }).session(session);

    if (!updatedUser) throw new Error("Updating user role failed!");

    const newBusiness = new Business({
      name: correctName,
      description: correctDesc,
      phone: req.body.phone,
      address: req.body.address,
      ownerId: req.user._id,
      tags: listOfTags,
    });
    const savedBusiness = await newBusiness.save();

    if (!savedBusiness) throw new Error("Nie udało się stworzyć firmy");

    await session.commitTransaction();
    return res.status(200).render("home", {
      user: req.user,
      business: savedBusiness,
      message: "Stworzono firme!",
    });
  } catch (err) {
    await session.abortTransaction();
    return res.status(401).render("businessRegister", {
      message: "Nie udało się stworzyć firmy.",
      tags: tagsGlobal
    });
  } finally {
    await session.endSession();
  }
};

const homeView = async (req, res) => {
  try {
    const business = await Business.findOne({ ownerId: req.user._id })
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const opinions = await Opinion.find({ _id: { $in: business.opinions } })
      .populate("ownerId")
      .exec();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "",
      opinions: opinions,
    });
  } catch (err) {
    console.log("ERR:", err);
    return res.render("home", {
      user: req.user,
      business:
        req.user.role == "Owner"
          ? await Business.findOne({ ownerId: req.user._id }).exec()
          : await Business.findOne({ workers: req.user._id }).exec(),
      message: "Nie można wyświetlić firmy.",
    });
  }
};


const getPagination = async (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getAllBusiness = async (req, res) => {
  const { limit, offset } = await getPagination(req.query.page - 1, 3);
  console.log(req.query);
  const searchName = req.query.name;
  const searchLocation = req.query.location;
  const searchTags = req.query.tags;
  if ((searchName != null && searchName != '') || (searchLocation != null && searchLocation != '') || searchTags != null) {
    Business.paginate({
      $and: [
        {
          $or: [
            { name: { $regex: searchName, $options: 'i' } },
            { description: { $regex: searchName, $options: 'i' } }
          ],
          tags: { $in: searchTags },
          address: { $regex: searchLocation, $options: 'i' },
        },
      ],
    }, { offset, limit, populate: 'services' }, (err, businesses) => {
      return res.render("searchBusiness", {
        user: req.user,
        tags: tagsGlobal,
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
    console.log(limit, offset)
    /*Business.paginate(
      {
        $and: [
          {
            $or: [
              { name: { $regex: searchName, $options: 'i' } },
              { description: { $regex: searchName, $options: 'i' } },
              { tags: { $in: searchTags } },
            ],
            address: { $regex: searchLocation, $options: 'i' },
          },
        ],
      },
      { offset, limit }
    )
      .then((businesses) => {
        const filteredBusinessesIds = [];
        businesses.docs.forEach((bussines) => {
          filteredBusinessesIds.push(bussines._id);
        });
        Business.find({ _id: { $in: filteredBusinessesIds } }).populate(["services", "ownerId"]).exec((err, businessesWithServices) => {
          return res.render("searchBusiness", {
            user: req.user,
            tags: tagsGlobal,
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
      .catch(async (err) => {
        console.log(err);
        return res.render("home", {
          user: req.user,
          business:
            req.user.role == "Owner"
              ? await Business.findOne({ ownerId: req.user._id }).exec()
              : await Business.findOne({ workers: req.user._id }).exec(),
          message: err
        });
      }); */
  } else {
    console.log(offset, limit);
    Business.paginate({}, { offset: offset, limit: limit, populate: 'services' }, (err, businesses) => {
      console.log(businesses)
      return res.render("searchBusiness", {
        user: req.user,
        tags: tagsGlobal,
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


    /*
        Business.paginate({}, { offset, limit })
          .then((businesses) => {
            Business.find({}).populate("services").exec((err, businessesWithServices) => {
              console.log(businesses.page);
              return res.render("searchBusiness", {
                user: req.user,
                tags: tagsGlobal,
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
          .catch(async (err) => {
            console.log(err);
            return res.render("home", {
              user: req.user,
              business:
                req.user.role == "Owner"
                  ? await Business.findOne({ ownerId: req.user._id }).exec()
                  : await Business.findOne({ workers: req.user._id }).exec(),
              message: err
            });
          });
          */
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

const getBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const opinions = await Opinion.find({ _id: { $in: business.opinions } })
      .populate(["ownerId"])
      .exec();
    return res.render("specificBusiness", {
      user: req.user,
      business: business,
      opinions: opinions,
      currentUser: req.user,
      workers: business.workers,
      message: "",
    });
  } catch (err) {
    return res.render("home", {
      user: req.user,
      business:
        req.user.role == "Owner"
          ? await Business.findOne({ ownerId: req.user._id }).exec()
          : await Business.findOne({ workers: req.user._id }).exec(),
      message: "Błąd podczas wyszukiwania firmy.",
    });
  }
};

const addOpinion = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const newOpinion = new Opinion({
      rating: req.body.rating,
      comment: req.body.comment,
      ownerId: req.user._id,
    });
    newOpinion.save({ session });
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { $push: { opinions: newOpinion.id } },
      { new: true, session }
    )
      .populate(["workers", "opinions", "ownerId", "services"])
      .exec();
    const opinionsIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionsIds } })
      .populate(["ownerId"])
      .exec();
    const message = "Dodano opinie.";
    await session.commitTransaction();
    return res.render("specificBusiness", {
      user: req.user,
      business: business,
      opinions: opinions,
      currentUser: req.user,
      workers: business.workers,
      message,
    });
  } catch (err) {
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const message = "Nie dodano opinii.";
    await session.abortTransaction();
    return res.render("specificBusiness", {
      user: req.user,
      business: business,
      opinions: business.opinions,
      currentUser: req.user,
      workers: business.workers,
      message,
    });
  } finally {
    await session.endSession();
  }
};

const removeOpinion = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { $pull: { opinions: req.params.idOpinion } },
      { session, new: true }
    )
      .populate(["workers", "opinions", "ownerId", "services"])
      .exec();
    await Opinion.findByIdAndDelete(req.params.idOpinion, { session }).exec();
    const opinions = await Opinion.find({ _id: { $in: business.opinions } })
      .populate(["ownerId"])
      .exec();
    const message = "Usunięto opinie.";
    await session.commitTransaction();
    return res.render("specificBusiness", {
      user: req.user,
      business: business,
      opinions: opinions,
      currentUser: req.user,
      workers: business.workers,
      message,
    });
  } catch (err) {
    console.log("ERR:", err);
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const message = "Nie dodano opinii.";
    await session.abortTransaction();
    return res.render("specificBusiness", {
      user: req.user,
      business: business,
      opinions: business.opinions,
      currentUser: req.user,
      workers: business.workers,
      message,
    });
  } finally {
    await session.endSession();
  }
};

const addWorker = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findOne({ invCode: req.body.code }).exec();
    if (user == null) throw new Error("Brak takiego użytkownika!");
    if (user.role != "Owner" && user.role != "Worker") {
      const business = await Business.findOneAndUpdate(
        { ownerId: req.user._id },
        { $push: { workers: user._id } },
        { new: true, session }
      )
        .populate(["ownerId", "workers", "opinions", "services"])
        .exec();
      console.log(business);
      await User.findOneAndUpdate(
        { _id: user._id },
        { role: "Worker" },
        { session }
      );
      const opinionIds = business.opinions;
      const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
      await session.commitTransaction();
      return res.render("business", {
        currentUser: req.user,
        user: req.user,
        business,
        message: "Pracownik dodany.",
        opinions: opinions,
      });
    } else {
      throw new Error("Użytkownik jest właścicielem lub pracownikiem.");
    }
  } catch (err) {
    console.log("ERR: ", err);
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.abortTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: err.message,
      opinions: opinions,
    });
  } finally {
    await session.endSession();
  }
};
const removeWorker = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.idWorker },
      { role: "User" },
      { new: true, session }
    ).exec();
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { $pull: { workers: user._id } },
      { new: true, session }
    )
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.commitTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Pracownik usunięty.",
      opinions: opinions,
    });
  } catch (err) {
    console.log("ERR: ", err);
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.abortTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Usuwanie niepomyślne.",
      opinions: opinions,
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
    const business = await Business.findByIdAndUpdate(businessId, update, {
      new: true,
      session,
    })
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.commitTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Serwis dodany.",
      opinions: opinions,
    });
  } catch (err) {
    console.log("ERR: ", err);
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.abortTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Dodawanie niepomyślne.",
      opinions: opinions,
    });
  } finally {
    await session.endSession();
  }
};

const removeService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Business.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { services: req.params.id } },
      { new: true, session }
    ).exec();
    await Service.findOneAndDelete(
      { _id: req.params.idService },
      { new: true, session }
    ).exec();
    await session.commitTransaction();
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.commitTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Serwis usunięty.",
      opinions: opinions,
    });
  } catch (err) {
    console.log("ERR: ", err);
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.abortTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Usuwanie niepomyślne.",
      opinions: opinions,
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
      {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
      },
      { new: true, session }
    ).exec();
    const business = await Business.findById(req.params.id, { new: true })
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.commitTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Edycja pomyślna.",
      opinions: opinions,
    });
  } catch (err) {
    console.log("ERR: ", err);
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.abortTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Edycja niepomyślna.",
      opinions: opinions,
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
    if (req.body.name) update = { name: req.body.name };
    else if (req.body.description)
      update = { description: req.body.description };
    else if (req.body.phone) {
      var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{3})$/; // validation of phone
      if (!re.test(req.body.phone)) {
        throw new Error("Nieprawidłowy numer telefonu.");
      }
      update = { phone: req.body.phone };
    } else if (req.body.address) update = { address: req.body.address };
    else {
      throw new Error("Brak parametrów.");
    }
    const business = await Business.findByIdAndUpdate(req.params.id, update, {
      new: true,
      session,
    })
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.commitTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Edycja pomyślna.",
      opinions: opinions,
    });
  } catch (err) {
    console.log("ERR: ", err);
    const business = await Business.findById(req.params.id)
      .populate(["ownerId", "workers", "opinions", "services"])
      .exec();
    const opinionIds = business.opinions;
    const opinions = await Opinion.find({ _id: { $in: opinionIds } }).exec();
    await session.abortTransaction();
    return res.render("business", {
      currentUser: req.user,
      user: req.user,
      business,
      message: "Edycja niepomyślna.",
      opinions: opinions,
    });
  } finally {
    await session.endSession();
  }
};

const removeBusiness = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const business = await Business.findById(req.params.id).exec();
    const workersIds = business.workers;
    const opinionsIds = business.opinions;
    const servicesIds = business.services;
    await User.findByIdAndUpdate(
      req.user._id,
      { role: "User" },
      { session }
    ).exec();
    await User.updateMany(
      { _id: { $in: workersIds } },
      { role: "User" },
      { session }
    ).exec();
    await Opinion.deleteMany({ _id: { $in: opinionsIds } }, { session }).exec(); // usuwanie opinii usuwanej firmy
    const opinionsToPull = await OpinionForUser.find({
      businessId: business._id,
    })
      .select("_id")
      .exec();
    await OpinionForUser.deleteMany(
      { businessId: business._id },
      { session }
    ).exec(); // usuwanie opinii wystawionych klientom
    let listOfIds = [];
    opinionsToPull.forEach((opinion) => {
      listOfIds.push(opinion._id);
    }); // id usunietych opinii
    console.log(listOfIds);
    await User.updateMany(
      { opinions: { $in: listOfIds } },
      { $pull: { opinions: { $in: listOfIds } } },
      { session }
    ).exec(); // usuniecie opinii z modelu uzytkownikow
    await Service.deleteMany({ _id: { $in: servicesIds } }, { session }).exec();
    await Business.findByIdAndRemove(req.params.id, { session }).exec();
    await session.commitTransaction();
    return res.render("home", {
      user: req.user,
      business: false,
      message: "Poprawnie usunięto firme.",
    });
  } catch (err) {
    console.log("ERROR: ", err);
    await session.abortTransaction();
    return res.render("home", {
      user: req.user,
      business:
        req.user.role == "Owner"
          ? await Business.findOne({ ownerId: req.user._id }).exec()
          : await Business.findOne({ workers: req.user._id }).exec(),
      //^ wyszukaj dla ownera, jesli nie to dla pracownika, jesli klient nie jest pracownikiem zwroci false.
      message: "Coś poszło nie tak.",
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
  removeBusiness,
  removeOpinion,
};
