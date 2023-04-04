const server = require("../index");
const request = require("supertest");
const axios = require("axios")

describe("POST /login", () => {
  beforeAll(() => {
    server.listen(5000)
  });


  it("should login with correct login data", async () => {
    const loginDataMock = { username: "test@test.com", password: "12345" };
    const res = await axios.post("http://localhost:5000/login", loginDataMock)
    expect(res.status).toBe(200);
  });

  it("should not login with incorrect login data", async () => {
    const loginDataMock = { username: "test@wrong.com", password: "54321" };
    const res = await axios.post("http://localhost:5000/login", loginDataMock)
    expect(res.status).toBe(401);
  });

  afterAll(() => {
    server.close();
  });
});
