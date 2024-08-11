
# Lorry Routing Tool CEGE0049

A technical guide for a web-based lorry routing tool. This demo generates routes between two destinations using Azure Map API with scenario and flow analysis functionalities. This tool is developed for the purpose of the MSc Geospatial Science Research project CEGE0049 Digitisation of CLP. This tool has the following functionalities.







## Features
- **Online Map** – This demo uses Microsoft Azure Map API for map rendering and routing services. 
- **Setting Scenarios** – This demo includes predefined scenarios that showcase different routing situations: Stages 1 to Stage 6 (construction stages). Data used are based on the CLOC's [completed CLOCS outline CLP example](https://www.clocs.org.uk/resources/clocs_example_template_2018.pdf) and [CLOCs completed CLP tool](https://www.clocs.org.uk/resources/clp_tool_example.xlsm)
- **Route Analysis** – upon lorry route calculation from multiple origins to the same destination, route analysis is conducted to highlight overlapping route segments. Green indicates the route for a given origin and destination, and red indicates overlapping route segments. 
- **Lorry Single Pair Route Calculation** – Calculate a Lorry route between a single pair of origin and destination based on specific lorry dimensions, weight and load type. Lorry options include vehicle width, vehicle height, vehicle length, vehicle weight and load type (e.g. explosives, flammable liquids). 

## Getting Started

### Prerequisites
- A modern web browser with JavaScript enabled. 
- Azure Maps account with valid subscription key (see [instructions](https://learn.microsoft.com/en-us/azure/azure-maps/quick-demo-map-app#get-the-subscription-key-for-your-account)) alternatively, see CEGE0049 Dissertation Report for subscription key. 

### Installation 
- Clone the repository or download the source files.
- Ensure you have internet access to load external libraries such as Azure Maps and Turf.js.

### Setup 
Azure Maps Subscription Key: Replace the placeholder in the `subscriptionKey` field in the `getMap()` function with your actual Azure Maps subscription key.
```
  authType: 'subscriptionKey',
  subscriptionKey: 'YOUR_AZURE_MAPS_SUBSCRIPTION_KEY'

```
### Running the demo
1.	Open ‘home.html’ in web browser. 
2.	Set Origin and Destination:
 - Enter the starting location in the "From" field (default: NW1 8NS).
- Enter the destination location in the "To" field (default: 18 Lodge Rd, London NW8 7JT).
3.	Configure Truck Options:
- Specify the truck dimensions (width, height, length, and weight) in the respective fields.
- Select the load type from the dropdown menu.
4.	Calculate Directions:
- Click the "Calculate Directions" button to generate the route. The map will display the calculated route, with green indicating the main route and red indicating overlapping segments.
5.	Select Scenario and Programme Month:
- Choose a scenario and select a programme month to view the corresponding average daily and monthly flow data.
