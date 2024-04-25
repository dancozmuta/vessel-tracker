export interface Vessel {
  id: string;
  staticData: {
    name: string;
    mmsi: number;
    imo: number;
    aisClass?: string;
    flag?: string;
    callsign?: string;
    dimensions: {
      length: number;
      width: number;
    };
    shipType?: string; 
  };
  lastPositionUpdate: {
    timestamp: string;
    latitude: number;
    longitude: number;
    collectionType: string;
  };
  currentVoyage: {
    destination?: string;
    draught?: number;
    eta?: string;
    updateTimestamp?: string;
  }
}
