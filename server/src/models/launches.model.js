const launches = new Map();

let latestFlightNumber = 100;

const launch = {
    flightNumber: 100,
    mission: "Kepler Exploration X",
    rocket: "Explorer IS1",
    launchDate: new Date('2030-03-25'),
    destination: "Kepler-442 b",
    customer: ['ZTM', "NASA"],
    upcoming: true,
    success: true
};

launches.set(launch.flightNumber, launch)

function getAllLaunches() {
    return Array.from(launches.values());
}

function addNewLaunches(launch) {
    latestFlightNumber++;
    launches.set(latestFlightNumber, Object.assign(launch, {
        flightNumber: latestFlightNumber,
        customer: ['Rom', 'NASA'],
        upcoming: true,
        success: true
    }));
}
module.exports = {
    getAllLaunches, addNewLaunches
}