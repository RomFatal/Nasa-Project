const request = require('supertest');
const app = require('../../app');

describe('Test GET /launches', () => {
    test('It should catch missing required properties', async () => {
        const response = await request(app)
            .get('/launches')
            .expect('Content-Type', /json/)
            .expect(200);
    })
});

describe('Test Post /launches', () => {
    const completeLaunchData = {
        mission: "Rom155",
        rocket: "Rom Explorer IS1",
        launchDate: "2035-02-06",
        target: "Rom-462"
    }
    const launchDataWithoutDate = {
        mission: "Rom155",
        rocket: "Rom Explorer IS1",
        target: "Rom-462"
    }
    const launchWithoutInvalidDate = {
        mission: "Rom155",
        rocket: "Rom Explorer IS1",
        target: "Rom-462",
        launchDate: "Invalid",
    }
    test('It should respond with 201 created', async () => {
        const response = await request(app)
            .post('/launches')
            .send(completeLaunchData)
            .expect('Content-Type', /json/)
            .expect(201);

        const requestDate = new Date(completeLaunchData.launchDate).valueOf();
        const responseDate = new Date(response.body.launchDate).valueOf();
        expect(requestDate).toBe(responseDate);;

        expect(response.body).toMatchObject(launchDataWithoutDate);;
    })

    test('It should catch missing required properties', async () => {
        const response = await request(app)
            .post('/launches')
            .send(launchDataWithoutDate)
            .expect('Content-Type', /json/)
            .expect(400);

        expect(response.body).toStrictEqual({
            error: 'Missing required launch property',
        });
    })

    test('It should catch invalid dates', async () => {
        const response = await request(app)
            .post('/launches')
            .send(launchWithoutInvalidDate)
            .expect('Content-Type', /json/)
            .expect(400);

        expect(response.body).toStrictEqual({
            error: 'Invalid launch date',
        });
    })
});
