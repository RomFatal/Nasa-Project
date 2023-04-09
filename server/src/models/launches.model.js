const axios = require('axios')
const launchesDataBase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;
const launch = {
    flightNumber: 100, //flight_number
    mission: "Kepler Exploration X", //name
    rocket: "Explorer IS1", //rocket.name
    launchDate: new Date('2030-03-25'), //date_local
    target: "Kepler-442 b", //not applicable
    customers: ['ZTM', "NASA"], //payload.customers for each payload
    upcoming: true, //upcoming
    success: true //success
};

saveLaunches(launch);
async function existsLaunchWithId(launchId) {
    return await launchesDataBase.findOne({
        flightNumber: launchId
    });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDataBase
        .findOne()
        .sort('-flightNumber');

    if (!latestLaunch)
        return DEFAULT_FLIGHT_NUMBER;

    return latestLaunch.flightNumber;
}
async function getAllLaunches() {
    return await launchesDataBase.find({}, {
        '__id': 0, '__v': 0
    });
}

async function saveLaunches(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target
    })
    if (!planet)
        throw new Error('No matching planet found');

    await launchesDataBase.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    });
}
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'
async function loadLaunchesData() {
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });
    
    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads']
        const customers = payloads.flatMap((payload) => {
            return payload['customers']
        })
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers,
        }
        console.log(`${launch.flightNumber} ${launch.mission}`)
    }
}

async function scheduleNewLaunches(launch) {
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        flightNumber: newFlightNumber,
        customers: ['Rom', 'NASA'],
        upcoming: true,
        success: true
    })
    await saveLaunches(newLaunch);
}

async function abortLaunchById(launchId) {
    const aborted = await launchesDataBase.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false
    });

    return aborted.modifiedCount === 1;
}

module.exports = {
    loadLaunchesData,
    getAllLaunches,
    scheduleNewLaunches,
    existsLaunchWithId,
    abortLaunchById
};