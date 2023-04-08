const launchesDataBase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;
const launch = {
    flightNumber: 100,
    mission: "Kepler Exploration X",
    rocket: "Explorer IS1",
    launchDate: new Date('2030-03-25'),
    target: "Kepler-442 b",
    customer: ['ZTM', "NASA"],
    upcoming: true,
    success: true
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
async function scheduleNewLaunches(launch) {
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        flightNumber: newFlightNumber,
        customer: ['Rom', 'NASA'],
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
    getAllLaunches, scheduleNewLaunches, existsLaunchWithId, abortLaunchById
}