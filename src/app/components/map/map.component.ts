import { Component, OnInit } from "@angular/core";
import * as L from "leaflet";
import { VesselService } from "../../services/vessel.service";
import { Vessel } from "../../models/vessel.interface";

@Component({
  selector: "app-map",
  standalone: true,
  imports: [],
  templateUrl: "./map.component.html",
  styleUrl: "./map.component.scss",
})
export class MapComponent implements OnInit {
  private map: L.Map | undefined;
  // Properties to store selected filter values
  selectedCountry: string | undefined;
  selectedShipType: string | undefined;

  constructor(private vesselService: VesselService) {}

  ngOnInit() {
    this.initMap();
    this.addVesselMarkers();
  }

  private initMap(): void {
    this.map = L.map("map", {
      center: [10, 0],
      zoom: 2,
      minZoom: 2,
      attributionControl: false
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      /* attribution: "© Spire", */
    }).addTo(this.map);
  }

  private addVesselMarkers(): void {
    if (!this.map) {
      console.error("Map has not been initialized");
      return;
    }
  
    this.vesselService.getVessels().subscribe({
      next: (data) => {
        data.data.vessels.nodes.forEach((vessel: Vessel) => {
          const lat = vessel.lastPositionUpdate.latitude;
          const lon = vessel.lastPositionUpdate.longitude;
          if (this.map) {
            const customIcon = L.divIcon({
              html: `<div class="leaflet-icon-container">
                       <img src="assets/images/map/ship_marker.png">
                       <span>${vessel.staticData.name}</span>
                     </div>`,
              iconSize: [38, 60], // Adjust the size as necessary
              iconAnchor: [19, 60], // Adjust anchor point to ensure the icon is correctly positioned
              popupAnchor: [0, -60], // Adjust the popup anchor
            });
  
            const marker = L.marker([lat, lon], { icon: customIcon }).addTo(this.map);
            marker.bindPopup(this.generatePopupContent(vessel));
          }
        });
      },
      error: (err) => console.error("Failed to load vessel data:", err),
    });
  }
  
  private generatePopupContent(vessel: Vessel): string {
    return `
      <div class="vessel-popup">
        <strong>Name:</strong> ${vessel.staticData.name}<br>
        <strong>MMSI:</strong> ${vessel.staticData.mmsi}<br>
        <strong>IMO:</strong> ${vessel.staticData.imo}<br>
        <strong>Type:</strong> ${vessel.staticData.shipType}<br>
        <strong>Country:</strong> ${vessel.staticData.flag}<br>
        <strong>Call Sign:</strong> ${vessel.staticData.callsign}<br>
        <strong>Dimensions:</strong> Length: ${vessel.staticData.dimensions.length}m, Width: ${vessel.staticData.dimensions.width}m<br>
        <strong>Last update:</strong> ${new Date(vessel.lastPositionUpdate.timestamp).toLocaleString()}<br>
        <strong>Last Known Position:</strong> latitude: ${vessel.lastPositionUpdate.latitude}
        longitude: ${vessel.lastPositionUpdate.longitude}
        <br>
        <strong>Destination:</strong> ${vessel.currentVoyage.destination || 'N/A'}<br>
        <strong>ETA:</strong> ${vessel.currentVoyage.eta ? new Date(vessel.currentVoyage.eta).toLocaleString() : 'N/A'}<br>
      </div>
    `;
  }
  
}
