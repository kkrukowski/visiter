const { isLoggedOut, isLoggedIn, isOwner } = require('../middlewares/authHandler'); // importuj funkcję
const Business = require('../models/Business');
const { ObjectId } = require('mongodb');


describe('isLoggedOut', () => {
    it('should call next() if user is not authenticated', () => {
        // deklaracja potrzebnych danych
        // jest.fn() -> wizualizacja funkcji
        // jest.fn().mockReturnValue(...) -> wizualizacja funkcji, ktora zwraca jakaś wartość
        const req = { isAuthenticated: jest.fn().mockReturnValue(false) };
        const res = { render: jest.fn() };
        const next = jest.fn();

        // wywoałanie middleware
        isLoggedOut(req, res, next);

        // oczekiwane rezultaty
        expect(req.isAuthenticated).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
    });

    it('should render home page with appropriate message if user is authenticated', async () => {
        // deklaracja danych
        const req = { isAuthenticated: jest.fn().mockReturnValue(true), user: { _id: 'userId', role: 'Owner' } };
        const business = [{ _id: 'businessId', name: 'Test Business' }];
        const res = { render: jest.fn() };
        const next = jest.fn();
        // jest.spyOn() do mockowania funkcji Business.find(), aby zwróciła oczekiwaną wartość, w tym przypadku wczesniej zadeklarowane business 
        jest.spyOn(Business, 'find').mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(business) });

        // wywołanie funkcji z odpowiednimi parametrami
        await isLoggedOut(req, res, next);

        // oczekiwany rezultat
        expect(req.isAuthenticated).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(res.render).toHaveBeenCalled();
    });
});
describe('isLoggedIn', () => {
    it('should call next() if user is authenticated', () => {
        const req = { isAuthenticated: jest.fn().mockReturnValue(true) };
        const res = { render: jest.fn() };
        const next = jest.fn();

        isLoggedIn(req, res, next);

        expect(req.isAuthenticated).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
    });
    it('should call res.render if user is not authenticated', () => {
        const req = { isAuthenticated: jest.fn().mockReturnValue(false) };
        const res = { render: jest.fn() };
        const next = jest.fn();

        isLoggedIn(req, res, next)

        expect(req.isAuthenticated).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(res.render).toHaveBeenCalled();
    });
})

describe('isOwner', () => {
    it('should call next() if user is owner of business', async () => {
        const req = {
            params: { id: "test-business-id" },
            user: { _id: new ObjectId("63a6ddae1a83354d2702f933") }
        }
        const res = { render: jest.fn() };
        const next = jest.fn();

        const business = { _id: "test-business-id", ownerId: new ObjectId("63a6ddae1a83354d2702f933") }
        jest.spyOn(Business, 'findOne').mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(business) });

        await isOwner(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
    });

    it('should call render if user is not owner of business', async () => {
        const req = {
            params: { id: "test-business-id" },
            user: { _id: new ObjectId("63a6ddae1a83354d2702f955") }// other user Id
        }
        const res = { render: jest.fn() };
        const next = jest.fn();
        const business = { _id: "test-business-id", ownerId: new ObjectId("63a6ddae1a83354d2702f933") }
        jest.spyOn(Business, 'find').mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(business) });
        jest.spyOn(Business, 'findOne').mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(business) });

        await isOwner(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.render).toHaveBeenCalled();
    });
})