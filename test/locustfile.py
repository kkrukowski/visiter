from locust import HttpUser, task
class HelloWorldUser(HttpUser):
    @task
    def hello_world(self):
        self.client.get("/")
    @task
    def logIn(self):
        req = {
            "username": "test@test.com",
            "password": "12345"
        }
        response = self.client.post("/login", req)
        print("LogIn code: ", response.request)
    @task
    def showBusiness(self):
        response = self.client.get("/business/search", auth = ("test@test.com", "12345"))
        print("Search code: ", response)