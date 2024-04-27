import { Component, OnInit } from "@angular/core";
import * as L from "leaflet";
import { VesselService } from "../../services/vessel.service";
import { Vessel } from "../../models/vessel.interface";
import { FilterComponent } from "../filter/filter.component";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-map",
  standalone: true,
  templateUrl: "./map.component.html",
  styleUrl: "./map.component.scss",
  imports: [FilterComponent, FormsModule],
})
export class MapComponent implements OnInit {
  private map: L.Map | undefined;
  private markers: L.Marker[] = [];
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
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 15,
    }).addTo(this.map);
  }

  private clearMarkers(): void {
    if (this.map && this.markers) {
      this.markers.forEach(marker => marker.remove());
      this.markers = []; // Clear the array
    }
  }

  private addVesselMarkers(shipType?: string): void {
    this.clearMarkers();
  
    if (!this.map) {
      console.error("Map has not been initialized");
      return;
    }
  
    let bounds: L.LatLngBounds | null = null;  // Initialize bounds as null
    this.vesselService.getVessels().subscribe({
      next: (data) => {
        data.data.vessels.nodes.forEach((vessel: Vessel) => {
          if (!shipType || vessel.staticData.shipType === shipType) {
            const lat = vessel.lastPositionUpdate.latitude;
            const lon = vessel.lastPositionUpdate.longitude;
            const marker = this.addMarker(lat, lon, vessel);
            if (marker) {
              this.markers.push(marker);
              bounds = bounds ? bounds.extend(marker.getLatLng()) : L.latLngBounds(marker.getLatLng(), marker.getLatLng());
            }
          }
        });
        // Check that bounds are not null before using them
        if (this.markers.length > 0 && this.map && bounds) {
          setTimeout(() => {
            if (this.map && bounds) {  // Double check for map and bounds to be not null
              this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
            }
          }, 400);  // Delay might be adjusted or removed based on actual needs
        }
      },
      error: (err) => console.error("Failed to load vessel data:", err),
    });
  }
  

  private addMarker(lat: number, lon: number, vessel: Vessel): L.Marker | undefined {
    if (this.map) {
      const customIcon = L.divIcon({
        html: `<div class="leaflet-icon-container">
                 <img src="assets/images/map/ship_marker.png">
                 <span>${vessel.staticData.name}</span>
               </div>`,
        iconSize: [38, 60],
        iconAnchor: [19, 60],
        popupAnchor: [0, -60]
      });

      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(this.map);
      marker.bindPopup(this.generatePopupContent(vessel));
      return marker;
    }
    return undefined; // Return undefined if map is not initialized
  }


  private generatePopupContent(vessel: Vessel): string {
    const formattedShipType = this.vesselService.formatShipType(vessel.staticData.shipType || 'Unknown');
    return `
      <div class="vessel-popup">
        <strong>Name:</strong> ${vessel.staticData.name}<br>
        <strong>MMSI:</strong> ${vessel.staticData.mmsi}<br>
        <strong>IMO:</strong> ${vessel.staticData.imo}<br>
        <strong>Type:</strong> ${formattedShipType}<br>
        <strong>Country:</strong> ${vessel.staticData.flag}<br>
        <strong>Call Sign:</strong> ${vessel.staticData.callsign}<br>
        <strong>Dimensions:</strong> Length: ${
          vessel.staticData.dimensions.length
        }m, Width: ${vessel.staticData.dimensions.width}m<br>
        <strong>Last update:</strong> ${new Date(
          vessel.lastPositionUpdate.timestamp
        ).toLocaleString()}<br>
        <strong>Last Known Position:</strong> latitude: ${
          vessel.lastPositionUpdate.latitude
        }
        longitude: ${vessel.lastPositionUpdate.longitude}
        <br>
        <strong>Destination:</strong> ${
          vessel.currentVoyage.destination || "N/A"
        }<br>
        <strong>ETA:</strong> ${
          vessel.currentVoyage.eta
            ? new Date(vessel.currentVoyage.eta).toLocaleString()
            : "N/A"
        }<br>
      </div>
    `;
  }

  onShipTypeChange(shipType: string) {
    this.selectedShipType = shipType; 
    this.addVesselMarkers(shipType); // Update markers based on selected ship type
  }
}
