const { isLoggedOut, isLoggedIn } = require('../middlewares/authHandler'); // importuj funkcję
const Business = require('../models/Business');


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
        const req = {isAuthenticated: jest.fn().mockReturnValue(true) };
        const res = {render: jest.fn()};
        const next = jest.fn();
        
        isLoggedIn(req, res, next);

        expect(req.isAuthenticated).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
    });
    it('should call res.render if user is not authenticated', ()=> {
        const req = {isAuthenticated: jest.fn().mockReturnValue(false) };
        const res = {render: jest.fn()};
        const next = jest.fn();

        isLoggedIn(req, res, next)

        expect(req.isAuthenticated).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(res.render).toHaveBeenCalled();
    });
})