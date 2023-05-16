from locust import HttpUser, task
class HelloWorldUser(HttpUser):
    def on_start(self):
        self.client.get("/login")
        req = {
            "username": "test@test.com",
            "password": "12345"
        }
        self.client.post("/login", req)
    @task
    def showBusiness(self):
        response = self.client.get("/business/search")
        print(response.text)
    @task
    def logout(self):
        self.client.post("/logout")