// Description: This file contains the code to calculate directions between multiple locations using the Azure Maps Routing service.
// The origins and destinations are hard coded with applications for Stage 1: Site set up and demolition only. 
function calculateDirectionsScenario() {
     routePoints = []; //Clear the route points.
     document.getElementById('output').innerHTML = ''; //Clear the output div.
     datasource.clear(); //Clear any existing routes.

    var from1 = 'NW1 8NS'; // Example from1 location
    var from2 = 'E3 4BH'; // Example from2 location
    var from3 = 'E16 2EZ'; // Example from3 location
    var to = '18 Lodge Rd, London NW8 7JT'; // Example to location

    geocodeQuery(from1, function(fromCoord1) {
        geocodeQuery(from2, function(fromCoord2) {
            geocodeQuery(from3, function(fromCoord3) {
                geocodeQuery(to, function(toCoord) {

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

                    processRequest(truckRequestUrl1).then(r => {
                        addRouteToMap(r.routes[0], 'green');
                        document.getElementById('output').innerHTML += 'Truck Distance 1: ' + Math.round(r.routes[0].summary.lengthInMeters / 10) / 100 + ' km<br/>';
                    });

                    processRequest(truckRequestUrl2).then(r => {
                        addRouteToMap(r.routes[0], 'green');
                        document.getElementById('output').innerHTML += 'Truck Distance 2: ' + Math.round(r.routes[0].summary.lengthInMeters / 10) / 100 + ' km<br/>';
                    });

                    processRequest(truckRequestUrl3).then(r => {
                        addRouteToMap(r.routes[0], 'green');
                        document.getElementById('output').innerHTML += 'Truck Distance 3: ' + Math.round(r.routes[0].summary.lengthInMeters / 10) / 100 + ' km<br/>';
                    });
                });
            });
        });
    });
}
