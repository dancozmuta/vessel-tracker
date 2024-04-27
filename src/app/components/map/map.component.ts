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
      let randomDelay = (Math.random() * 0.3).toFixed(1); // Generates a random delay up to 0.8 seconds
      const customIcon = L.divIcon({
        html: `<div class="leaflet-icon-container animated-marker" style="animation-delay: ${randomDelay}s;">
                 <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" version="1.1" viewBox="0 0 90.91 99.02"><defs><style>.cls-2{stroke-width:0;fill:#fff}</style></defs><path d="M90.91 45.45C90.91 20.35 70.56 0 45.45 0S0 20.35 0 45.45c0 21.63 15.12 39.72 35.36 44.31.7.16.1.02.1.02l9.99 9.23 9.64-9.16s-.35.08.3-.07c20.32-4.53 35.52-22.66 35.52-44.35Z" class="cls-2"/><circle cx="45.45" cy="45.45" r="40.24" style="stroke-width:0;fill:#008082" transform="rotate(-45 45.448 45.455)"/><path d="M32.63 43.69V33.43c0-.89.72-1.6 1.6-1.6h8.02v-3.21h6.41v3.21h8.02c.89 0 1.6.72 1.6 1.6v10.26l1.74.52c.82.25 1.3 1.09 1.09 1.92l-2.43 9.73h-.4c-.93 0-1.82-.16-2.65-.45l2-8.58-12.19-3.8-12.19 3.8 2 8.58c-.83.29-1.72.45-2.65.45h-.4l-2.43-9.73c-.21-.83.27-1.68 1.09-1.92l1.74-.52Zm3.2-.96 9.62-2.89 9.62 2.89v-7.7H35.83v7.7Zm-3.2 16.35c2.46 0 4.71-.93 6.41-2.45 1.7 1.52 3.95 2.45 6.41 2.45s4.71-.93 6.41-2.45a9.596 9.596 0 0 0 6.41 2.45h3.21v3.21h-3.21c-2.34 0-4.53-.62-6.41-1.72-1.89 1.09-4.08 1.72-6.41 1.72s-4.53-.62-6.41-1.72a12.799 12.799 0 0 1-6.41 1.72h-3.21v-3.21h3.21Z" class="cls-2"/></svg>
                 <span>${vessel.staticData.name}</span>
               </div>`,
        className: 'custom-marker',
        iconAnchor: [19, 60],
        popupAnchor: [0, -70]
      });

      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(this.map);

    marker.on('click', () => {
      (marker as any)._icon.classList.add('enlarged-marker');
  });

    // Resize marker when popup is opened and then closed
    marker.bindPopup(this.generatePopupContent(vessel), {
      closeButton: true
    }).on('popupopen', (e) => {
      e.target._icon.classList.add('enlarged-marker');
    }).on('popupclose', (e) => {
      e.target._icon.classList.remove('enlarged-marker');
    });

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
