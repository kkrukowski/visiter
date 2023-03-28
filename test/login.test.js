const server = require("../index");
const request = require('supertest');
const loginHandler = require("../middlewares/loginHandler")

describe("POST /login", () => {
    test("should login with correct login data", async () => {
        const loginDataMock = {email: "test@test.com", password: "12345"}
        await loginHandler.loginValidation(loginDataMock, _, next)
        const res = await request(server).post("/login").send(loginDataMock);
        expect(res.statusCode).toBe(200);
    })

    test("should not login with incorrent login data", async () => {
        const loginDataMock = {email: "test@test.com", password: "wrongpass"}
        const res = await request(server).post("/login").send(loginDataMock);
        expect(res.statusCode).toBe(401)
    })
})