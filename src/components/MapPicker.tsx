/*import { LocationAsStr } from 'models/types';
import React from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';

interface MapPickerProps {
  familyLocation: LocationAsStr;
  updateFamilyLocation: (newLat?: string, newLong?: string) => void;
}

const MapPicker = withScriptjs(
  withGoogleMap((props: MapPickerProps) => {
    const { familyLocation, updateFamilyLocation } = props;

    return (
      <GoogleMap
        defaultZoom={8}
        defaultCenter={{ lat: parseFloat(familyLocation.lat), lng: parseFloat(familyLocation.long) }}
      >
        <Marker
          position={{ lat: parseFloat(familyLocation.lat), lng: parseFloat(familyLocation.long) }}
          draggable={true}
          onDragEnd={(coords) => updateFamilyLocation(`${coords.latLng.lat()}`, `${coords.latLng.lng()}`)}
        />
      </GoogleMap>
    );
  })
);

export default MapPicker;
*/

export {};
