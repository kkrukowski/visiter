const app = require("../index");
const request = import('supertest');

describe("POST /login", () => {
    test("should login with correct credentials", async() => {
        const response = await request(app).post("/login").send({email: "test@test.com", password: "12345"});
        expect(response.statusCode).toBe(200);
    })
})