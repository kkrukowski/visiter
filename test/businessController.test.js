const server = require("../index");
const request = require("supertest");
const Business = require("../models/Business");
const Opinion = require("../models/OpinionForBusiness");
const { ObjectId } = require("mongodb");
const { addOpinion } = require("../controller/businessController");

describe("POST /register", () => {
  test("should register new business and change role of user to owner", async () => {
    const userDataMock = {
      name: "Nazwa Firmy",
      description: "Opis firmy",
      phone: 123456789,
      address: "Katowice, ul. Chorzowska 24",
      ownerId: "6425bda5880c2fd247173d8c",
    };
    const res = await request(server)
      .post("/business/register")
      .send(userDataMock);
    await expect(res.statusCode).toBe(200);
  });
});

describe("add opinion test", () => {
  it("should add opinion to business", async () => {
    const req = ({
      body: {
        rating: 4,
        comment: "test comment",
        ownerId: new ObjectId("63a6ddae1a83354d2702f933") // id usera dodajacego opinie
      },
      params: {
        id: new ObjectId("63a6ddae1a83354d2702f955") // id firmy
      }
    });
    const business = new Business({
      name: "test",
      description: "test",
      ownerId: new ObjectId("63a6ddae1a83354d2702f999"),
      address: "ul. test",
      phone: "505505050",
      tags: ["Fryzjerstwo"],
    
      workers: [],
      opinions: [],
      services: [],
    })
    // jest.spyOn nie zezwala na uzycie dwoch funckji w jednym modelu, tj. .populate oraz .exec
    const res = await request(server)
      .post("/business/63b7015741e1b4cc6ecc9b62/opinion")
      .send(req);
    await expect(res.statusCode).toBe(200);
  });
});
