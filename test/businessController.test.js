const server = require("../index");
const request = require("supertest");

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
