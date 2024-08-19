// Description: This file contains the code to initialise the Azure Maps map, geocoding and routing services.
// This file also contains the hard-coded scenario data

// Defining Variable
var map, datasource, routePoints = [], currentScenario;

        var coordinateRx = /^-?[0-9]+\.?[0-9]*\s*,+\s*-?[0-9]+\.?[0-9]*$/;
        var geocodeRequestUrl = 'https://{azMapsDomain}/geocode?api-version=2023-06-01&query={query}&view=Auto';
        var carRoutingRequestUrl = 'https://{azMapsDomain}/route/directions/json?api-version=1.0&query={query}&routeRepresentation=polyline&travelMode=car&view=Auto';
        var truckRoutingRequestUrl = 'https://{azMapsDomain}/route/directions/json?api-version=1.0&query={query}&routeRepresentation=polyline&vehicleLength={vehicleLength}&vehicleHeight={vehicleHeight}&vehicleWidth={vehicleWidth}&vehicleWeight={vehicleWeight}&travelMode=truck&view=Auto';
        //HC: Route COordinates
        var routeCoordinates1 = [];
        var routeCoordinates2 = [];
        var routeCoordinates3 = [];

        var scenarios = [
            //HC: S1 Scenario
            { from1: 'NW1 8NS', from2: 'E3 4BH', from3: 'E16 2EZ', to: '18 Lodge Rd, London NW8 7JT', height: '', width: '', length: '', weight: '', load: [], description: 'Stage 1', streetsideLink: 'https://binged.it/2hd6P3s' },
            //HC: S2 Scenario
            { from: 'E3 4BH', to: '18 Lodge Rd, London NW8 7JT', height: '', width: '', length: '', weight: '', load: [], description: 'Stage 2'},
            //HC: S3 Scenario
            { from: 'E16 2EZ', to: '18 Lodge Rd, London NW8 7JT', height: '', width: '', length: '', weight: '', load: [], description: 'Stage 3'},
            //HC: S4 Scenario
            { from: 'UB6 0AA', to: '18 Lodge Rd, London NW8 7JT', height: '', width: '', length: '', weight: '', load: [], description: 'Stage 4'},
            //HC: S5 Scenario
            { from: 'AL9 7HF', to: '18 Lodge Rd, London NW8 7JT', height: '', width: '', length: '', weight: '', load: [], description: 'Stage 5'},
            //HC: S6 Scenario
            { from: 'NW1 8NS', to: '18 Lodge Rd, London NW8 7JT', height: '', width: '', length: '', weight: '', load: [], description: 'Stage 6'},

        ];

        // Functure to initial map
        function getMap() {
            //Initialize a map instance.
            map = new atlas.Map('myMap', {
                view: 'Auto',

                // Add authentication details for connecting to Azure Maps.
                authOptions: {
                    // Use an Azure Maps key.
                    authType: 'subscriptionKey',
                    subscriptionKey: 'YOUR_AZURE_MAPS_SUBSCRIPTION_KEY'
}
            });

            //Wait until the map resources are ready.
            map.events.add('ready', function () {
                //Create a data source to store the data in.
                datasource = new atlas.source.DataSource();
                map.sources.add(datasource);

                //Add a layer for rendering line data.
                map.layers.add(new atlas.layer.LineLayer(datasource, null, {
                    strokeColor: ['get', 'strokeColor'],
                    strokeWidth: 5
                }), 'labels');

                //Add a layer for rendering point data.
                map.layers.add(new atlas.layer.SymbolLayer(datasource, null, {
                    iconOptions: {
                        image: ['get', 'icon']
                    },
                    textOptions: {
                        textField: ['get', 'title'],
                        size: 14,
                        font: ['SegoeUi-Bold'],
                        offset: [0, 1.2]
                    },
                    filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] //Only render Point or MultiPoints in this layer.
                }));

                //HC: Load scenarios visual design updates
                var scenarioHtml = ['<table style="width:50%; margin-left:auto; margin-right:auto;">'];

                for (var i = 0; i < scenarios.length; i++) {
                    // Ensure each button is in its own row and cell
                    scenarioHtml.push('<tr><td style="text-align:center;"><input type="button" style="width:100%;" value="', scenarios[i].description, '" onclick="loadScenario(', i, ')" /></td></tr>');
                }

                scenarioHtml.push('</table>');


                document.getElementById('scenarios').innerHTML = scenarioHtml.join('');
            });
        }

        function calculateDirections() {
            routePoints = [];
            document.getElementById('output').innerHTML = '';
            datasource.clear();

            var from = document.getElementById('fromTbx').value;

            geocodeQuery(from, function (fromCoord) {
                var to = document.getElementById('toTbx').value;

                geocodeQuery(to, function (toCoord) {

                    //Create pins for the start and end of the route.
                    var startPoint = new atlas.data.Point(fromCoord);
                    var startPin = new atlas.data.Feature(startPoint, {
                        title: 'Start',
                        icon: 'pin-round-blue'
                    });

                    var endPoint = new atlas.data.Point(toCoord);
                    var endPin = new atlas.data.Feature(endPoint, {
                        title: 'End',
                        icon: 'pin-round-red'
                    });

                    //Fit the map window to the bounding box defined by the start and end points.
                    map.setCamera({
                        bounds: atlas.data.BoundingBox.fromData([toCoord, fromCoord]),
                        padding: 50
                    });

                    //Add pins to the map for the start and end point of the route.
                    datasource.add([startPin, endPin]);

                    //Convert lon,lat into lat,lon.
                    fromCoord.reverse();
                    toCoord.reverse()

                    var query = fromCoord.join(',') + ':' + toCoord.join(',');
                    console.log(query);

                    //truck request url
                    var truckRequestUrl = truckRoutingRequestUrl.replace('{query}', query);

                    //check if there are any loadtype inputs
                    var loadType = getSelectValues('vehicleLoadType');
                    if (loadType && loadType !== '') {
                        truckRequestUrl += '&vehicleLoadType=' + loadType;
                    }

                    //adding dimensions to the truck request url
                    truckRequestUrl = setValueOptions(truckRequestUrl, ['vehicleWidth', 'vehicleHeight', 'vehicleLength']);

                    //convert vehicle weight to kg by multiplying by 1000
                    var vehicleWeight = document.getElementById('vehicleWeight').value;
                    if (vehicleWeight && vehicleWeight !== '') {
                        vehicleWeight *= 1000;
                        truckRequestUrl = truckRequestUrl.replace('{vehicleWeight}', vehicleWeight);
                        console.log(vehicleWeight);
                    } else {
                        truckRequestUrl = truckRequestUrl.replace('{vehicleWeight}', '');
                    }

                    //make the request to the truck routing API and add the route to the map.
                    processRequest(truckRequestUrl).then(r => {
                        addRouteToMap(r.routes[0], 'green');
                        // indicate route length
                        document.getElementById('output').innerHTML += 'Lorry Route Distance: ' + Math.round(r.routes[0].summary.lengthInMeters / 10) / 100 + ' km<br/>';
                    });
                });
            });
        }

        //Geocode the query and return the first coordinate.
        function geocodeQuery(query, callback) {
            if (callback) {
                //Check to see if the query is a coordinate. if so, it doesn't need to be geocoded.
                if (coordinateRx.test(query)) {
                    var vals = query.split(',');

                    callback([parseFloat(vals[1]), parseFloat(vals[0])]);
                } else {
                    var requestUrl = geocodeRequestUrl.replace('{query}', encodeURIComponent(query));

                    processRequest(requestUrl).then(r => {
                        if (r && r.features && r.features.length > 0) {
                            callback([r.features[0].geometry.coordinates[0], r.features[0].geometry.coordinates[1]]);
                        }
                    });
                }
            }
        }

        function addRouteToMap(route, strokeColor) {
            var routeCoordinates = [];

            for (var legIndex = 0; legIndex < route.legs.length; legIndex++) {
                var leg = route.legs[legIndex];

                //Convert the route point data into a format that the map control understands.
                var legCoordinates = leg.points.map(function (point) {
                    return [point.longitude, point.latitude];
                });

                //Combine the route point data for each route leg together to form a single path.
                routeCoordinates = routeCoordinates.concat(legCoordinates);
                console.log(routeCoordinates);
            }

            //Create a LineString from the route path points and add it to the line layer.
            datasource.add(new atlas.data.Feature(new atlas.data.LineString(routeCoordinates), {
                strokeColor: strokeColor
            }));

            //Fit the map window to the bounding box defined by the route points.
            routePoints = routePoints.concat(routeCoordinates);
            map.setCamera({
                bounds: atlas.data.BoundingBox.fromPositions(routePoints),
                padding: 50
            });
        }

        // Return a set of the selected opion value for a multi-select as a comma delimited string.
        function getSelectValues(id) {
            var select = document.getElementById(id);
            var selected = [];

            for (var i = 0; i < select.length; i++) {
                if (select.options[i].selected) {
                    selected.push(select.options[i].value);
                }
            }

            return selected.join(',');
        }

        // Process a request to the Azure Maps REST services.
        function setValueOptions(requestUrl, valueOptions) {
            for (var i = 0; i < valueOptions.length; i++) {
                requestUrl = requestUrl.replace('{' + valueOptions[i] + '}', document.getElementById(valueOptions[i]).value);
            }

            return requestUrl;
        }

        // Load the selected scenario
        function loadScenario(scenarioNum) {
            var scenario = scenarios[scenarioNum];

            // Set the values of the input fields based on the selected scenario
            document.getElementById('fromTbx').value = scenario.from;
            document.getElementById('toTbx').value = scenario.to;
            document.getElementById('vehicleWidth').value = scenario.width;
            document.getElementById('vehicleHeight').value = scenario.height;
            document.getElementById('vehicleLength').value = scenario.length;
            document.getElementById('vehicleWeight').value = scenario.weight;

            var vehicleLoadTypeSelect = document.getElementById('vehicleLoadType');

            // Set the selected options in the vehicleLoadType select element based on the selected scenario
            for (var i = 0; i < vehicleLoadTypeSelect.length; i++) {
                if (scenario.load.indexOf(vehicleLoadTypeSelect.options[i].value) > -1) {
                    vehicleLoadTypeSelect.options[i].selected = 'selected';
                } else {
                    vehicleLoadTypeSelect.options[i].selected = null;
                }
            }

            calculateDirectionsScenario();
        }