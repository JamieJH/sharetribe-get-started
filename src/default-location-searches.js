import { types as sdkTypes } from './util/sdkLoader';

const { LatLng, LatLngBounds } = sdkTypes;

// An array of locations to show in the LocationAutocompleteInput when
// the input is in focus but the user hasn't typed in any search yet.
//
// Each item in the array should be an object with a unique `id` (String) and a
// `predictionPlace` (util.types.place) properties.
// LatLngBounds: (NE, SW); NE: (top lat, right long); SW: (bottom lat, left long)
const defaultLocations = [
  {
    id: 'default-hcm',
    predictionPlace: {
      address: 'Ho Chi Minh City, Vietnam',
      bounds: new LatLngBounds(new LatLng(11.1602136037603, 107.0265769179448), new LatLng(10.34937042531151, 106.3638783822327)),
    },
  },
  {
    id: 'default-hanoi',
    predictionPlace: {
      address: 'Hanoi, Vietnam',
      bounds: new LatLngBounds(new LatLng(21.05038011368417, 105.876445869669), new LatLng(20.99509906891873, 105.7974814649321)),
    },
  },
  {
    id: 'default-ang-mo-kio',
    predictionPlace: {
      address: 'Ang Mo Kio, Singapore',
      bounds: new LatLngBounds(new LatLng(1.397721839127159, 103.8609150756841), new LatLng(1.355478941160012, 103.8166767162855)),
    },
  },
  {
    id: 'default-bukit-batok',
    predictionPlace: {
      address: 'Bukit Batok, Singapore',
      bounds: new LatLngBounds(new LatLng(1.379648922141728, 103.7703429517945), new LatLng(1.332504612862478, 103.7365401096342)),
    },
  },
  // {
  //   id: 'default-ruka',
  //   predictionPlace: {
  //     address: 'Ruka, Finland',
  //     bounds: new LatLngBounds(new LatLng(66.16997, 29.16773), new LatLng(66.16095, 29.13572)),
  //   },
  // },
];
export default defaultLocations;
