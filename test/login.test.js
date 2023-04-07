const server = require("../index");
const request = require("supertest");

describe("POST /login", () => {
  it("should login with correct login data", async () => {
    const loginDataMock = { username: "test@test.com", password: "12345" };
    const res = await request(server).post("/login").send(loginDataMock);
    await expect(res.status).toBe(200);
  });

  it("should not login with incorrect login data", async () => {
    const loginDataMock = { username: "test@wrong.com", password: "54321" };
    const res = await request(server).post("/login").send(loginDataMock);
    await expect(res.status).toBe(401);
  });
});
