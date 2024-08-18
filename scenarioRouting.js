// Description: This file contains the code to calculate directions between multiple locations using the Azure Maps Routing service.
// The origins and destinations are hard coded with applications for Stage 1: Site set up and demolition only.

var routeCoordinates1 = [];
var routeCoordinates2 = [];
var routeCoordinates3 = [];
function calculateDirectionsScenario() {
    routePoints = []; //Clear the route points.
    document.getElementById('output').innerHTML = ''; //Clear the output div.
    datasource.clear(); //Clear any existing routes.

    var from1 = 'NW1 8NS'; // Example from1 location
    var from2 = 'E3 4BH'; // Example from2 location
    var from3 = 'E16 2EZ'; // Example from3 location
    var to = '18 Lodge Rd, London NW8 7JT'; // Example to location

    geocodeQuery(from1, function (fromCoord1) {
        geocodeQuery(from2, function (fromCoord2) {
            geocodeQuery(from3, function (fromCoord3) {
                geocodeQuery(to, function (toCoord) {

                    //Create pins for the start and end of the route.
                    var startPoint1 = new atlas.data.Point(fromCoord1);
                    var startPin1 = new atlas.data.Feature(startPoint1, {
                        title: 'Start 1',
                        icon: 'pin-round-blue'
                    });

                    var startPoint2 = new atlas.data.Point(fromCoord2);
                    var startPin2 = new atlas.data.Feature(startPoint2, {
                        title: 'Start 2',
                        icon: 'pin-round-blue'
                    });

                    var startPoint3 = new atlas.data.Point(fromCoord3);
                    var startPin3 = new atlas.data.Feature(startPoint3, {
                        title: 'Start 3',
                        icon: 'pin-round-blue'
                    });

                    var endPoint = new atlas.data.Point(toCoord);
                    var endPin = new atlas.data.Feature(endPoint, {
                        title: 'End',
                        icon: 'pin-round-red'
                    });

                    //Fit the map window to the bounding box defined by the start and end points.
                    map.setCamera({
                        bounds: atlas.data.BoundingBox.fromData([toCoord, fromCoord1, fromCoord2, fromCoord3]),
                        padding: 50
                    });

                    //Add pins to the map for the start and end point of the route.
                    datasource.add([startPin1, startPin2, startPin3, endPin]);

                    //Convert lon,lat into lat,lon.
                    fromCoord1.reverse();
                    fromCoord2.reverse();
                    fromCoord3.reverse();
                    toCoord.reverse();

                    var query1 = fromCoord1.join(',') + ':' + toCoord.join(',');
                    var query2 = fromCoord2.join(',') + ':' + toCoord.join(',');
                    var query3 = fromCoord3.join(',') + ':' + toCoord.join(',');

                    //truck request
                    var truckRequestUrl1 = truckRoutingRequestUrl.replace('{query}', query1);
                    var truckRequestUrl2 = truckRoutingRequestUrl.replace('{query}', query2);
                    var truckRequestUrl3 = truckRoutingRequestUrl.replace('{query}', query3);

                    var loadType = getSelectValues('vehicleLoadType');
                    if (loadType && loadType !== '') {
                        truckRequestUrl1 += '&vehicleLoadType=' + loadType;
                        truckRequestUrl2 += '&vehicleLoadType=' + loadType;
                        truckRequestUrl3 += '&vehicleLoadType=' + loadType;
                    }

                    truckRequestUrl1 = setValueOptions(truckRequestUrl1, ['vehicleWidth', 'vehicleHeight', 'vehicleLength']);
                    truckRequestUrl2 = setValueOptions(truckRequestUrl2, ['vehicleWidth', 'vehicleHeight', 'vehicleLength']);
                    truckRequestUrl3 = setValueOptions(truckRequestUrl3, ['vehicleWidth', 'vehicleHeight', 'vehicleLength']);

                    var vehicleWeight = document.getElementById('vehicleWeight').value;
                    if (vehicleWeight && vehicleWeight !== '') {
                        vehicleWeight *= 1000;
                        truckRequestUrl1 = truckRequestUrl1.replace('{vehicleWeight}', vehicleWeight);
                        truckRequestUrl2 = truckRequestUrl2.replace('{vehicleWeight}', vehicleWeight);
                        truckRequestUrl3 = truckRequestUrl3.replace('{vehicleWeight}', vehicleWeight);
                    } else {
                        truckRequestUrl1 = truckRequestUrl1.replace('{vehicleWeight}', '');
                        truckRequestUrl2 = truckRequestUrl2.replace('{vehicleWeight}', '');
                        truckRequestUrl3 = truckRequestUrl3.replace('{vehicleWeight}', '');
                    }
                    // Initiates three asynchronous requests in parallel 
                    Promise.all([
                        processRequest(truckRequestUrl1),
                        processRequest(truckRequestUrl2),
                        processRequest(truckRequestUrl3)
                        // waits until all requests are resolved before executing call back function
                    ]).then(processRoutesAndCalculateIntersections);
                });
            });
        });
    });
}


function addRouteToMapScenario(route, strokeColor, routeIndex) {
    var routeCoordinates = [];

    for (var legIndex = 0; legIndex < route.legs.length; legIndex++) {
        var leg = route.legs[legIndex];

        // Convert the route point data into a format that the map control understands.
        var legCoordinates = leg.points.map(function (point) {
            return [point.longitude, point.latitude];
        });

        // Combine the route point data for each route leg together to form a single path.
        routeCoordinates = routeCoordinates.concat(legCoordinates);
    }

    // Store the route coordinates in the corresponding array
    if (routeIndex === 1) {
        routeCoordinates1 = routeCoordinates;
    } else if (routeIndex === 2) {
        routeCoordinates2 = routeCoordinates;
    } else if (routeIndex === 3) {
        routeCoordinates3 = routeCoordinates;
    }

    console.log('route1', routeCoordinates1);

    // Create a LineString from the route path points and add it to the line layer.
    datasource.add(new atlas.data.Feature(new atlas.data.LineString(routeCoordinates), {
        strokeColor: strokeColor
    }));

    // Fit the map window to the bounding box defined by the route points.
    routePoints = routePoints.concat(routeCoordinates);
    map.setCamera({
        bounds: atlas.data.BoundingBox.fromPositions(routePoints),
        padding: 50
    });
}


// Function to segment a LineString
function segmentLineString(lineString) {
    var segments = [];
    var coords = lineString.geometry.coordinates;

    for (var i = 0; i < coords.length - 1; i++) {
        var segment = turf.lineString([coords[i], coords[i + 1]]);
        segments.push(segment);
    }

    return segments;
}
// Function to process a routing request
function processRouteAndAddToMap(routeResponse, strokeColor, routeIndex) {
    return new Promise(resolve => {
        addRouteToMapScenario(routeResponse.routes[0], strokeColor, routeIndex);
        resolve(); // Resolve the promise once the route is processed and added to the map
    });
}
// Function to calculate intersections between routes
function processRoutesAndCalculateIntersections(results) {
    var r1 = results[0];
    var r2 = results[1];
    var r3 = results[2];

    var addRoutePromises = [
        addRouteToMapScenario(r1.routes[0], 'green', 1),
        addRouteToMapScenario(r2.routes[0], 'green', 2),
        addRouteToMapScenario(r3.routes[0], 'green', 3)
    ];

    Promise.all(addRoutePromises).then(function() {
        // Display truck distances
        document.getElementById('output').innerHTML += 'Lorry Route Distance 1: ' + Math.round(r1.routes[0].summary.lengthInMeters / 10) / 100 + ' km<br/>';
        document.getElementById('output').innerHTML += 'Lorry Route Distance 2: ' + Math.round(r2.routes[0].summary.lengthInMeters / 10) / 100 + ' km<br/>';
        document.getElementById('output').innerHTML += 'Lorry Route Distance 3: ' + Math.round(r3.routes[0].summary.lengthInMeters / 10) / 100 + ' km<br/>';

        console.log('r1: ', routeCoordinates1);
        console.log('r2: ', routeCoordinates2);
        console.log('r3: ', routeCoordinates3);

        var route1LineString = turf.lineString(routeCoordinates1);
        var route2LineString = turf.lineString(routeCoordinates2);
        var route3LineString = turf.lineString(routeCoordinates3);

        var route1Segments = segmentLineString(route1LineString);
        var route2Segments = segmentLineString(route2LineString);
        var route3Segments = segmentLineString(route3LineString);

        // Array to store coordinates of overlapping segments
        var overlappingSegmentsCoordinates = [];

        // Loop through each segment of route2
        route2Segments.forEach(function (segment2) {
            // Loop through each segment of route3
            route3Segments.forEach(function (segment3) {
                var intersection = turf.lineIntersect(segment2, segment3);
                if (intersection.features.length > 0) {
                    // Add intersecting segments to array
                    intersection.features.forEach(function (feature) {
                        overlappingSegmentsCoordinates.push(feature.geometry.coordinates);
                    });
                }
            });
        });

        console.log(overlappingSegmentsCoordinates);
        // Add the overlapping segments to the map
        if (overlappingSegmentsCoordinates.length > 0) {
            datasource.add(new atlas.data.Feature(new atlas.data.LineString(overlappingSegmentsCoordinates), {
                strokeColor: 'red'
            }));
        }
    });
}

                document.addEventListener('DOMContentLoaded', function() {
    // Mapping of months to their respective totals
    var monthTotals = {
        'Apr-25': 550,
        'May-25': 550,
        'Jun-25': 550,
        'Jul-25': 880,
        'Aug-25': 880,
        'Sep-25': 880,
        'Oct-25': 880,
        'Nov-25': 700
    };

    // Function to update the dailyFlow div
    function updateDailyFlow() {
        var selectedMonth = document.getElementById('programmeMonth').value;
        var total = monthTotals[selectedMonth];
        document.getElementById('monthlyFlow').innerHTML = total;
        document.getElementById('dailyFlow').innerHTML = Math.round(total / 30);
    }

    //function to handle month selection chagne
    function onMonthSelectionChange() {
        updateDailyFlow();
        calculateDirectionsScenario();
    }

    // Add event listener to the programmeMonth select element
    document.getElementById('programmeMonth').addEventListener('change', onMonthSelectionChange);

    // Initial update in case the page is loaded with a default selection
    updateDailyFlow();
    calculateDirectionsScenario();
});