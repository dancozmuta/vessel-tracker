import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import * as L from "leaflet";
import { VesselService } from "../../services/vessel.service";
import { Vessel } from "../../models/vessel.interface";
import { FilterComponent } from "../filter/filter.component";
import { FormsModule } from "@angular/forms";
import { ButtonComponent } from "../button/button.component";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-map",
  standalone: true,
  templateUrl: "./map.component.html",
  styleUrl: "./map.component.scss",
  imports: [FilterComponent, FormsModule, ButtonComponent, CommonModule],
})
export class MapComponent implements OnInit {
  private map: L.Map | undefined;
  private markers: L.Marker[] = [];
  private allVessels: Vessel[] = []; // Store all vessels data here
  selectedShipType: string = "all";
  showFilters: boolean = false;
  @Output() shipTypesAvailable = new EventEmitter<
    { formattedType: string; originalType: string; count: number }[]
  >();
  shipTypes: { formattedType: string; originalType: string; count: number }[] =
    [];

  constructor(private vesselService: VesselService) {}

  ngOnInit() {
    this.initMap();
    this.fetchVesselsAndTypes(); // Fetch vessels and ship types once
  }

  private initMap(): void {
    this.map = L.map("map", {
      center: [10, 0],
      zoom: 3,
      minZoom: 3,
      maxZoom: 15,
      attributionControl: false,
      worldCopyJump: true,
      maxBoundsViscosity: 1.0,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 15,
      noWrap: false, // This allows for horizontal "infinite" scrolling
    }).addTo(this.map);
  }

  handleToggle(isShown: boolean): void {
    this.showFilters = isShown;
  }

  private fetchVesselsAndTypes(): void {
    this.vesselService.getVessels().subscribe({
      next: (data) => {
        this.allVessels = data.data.vessels.nodes;
        this.extractAndEmitShipTypes(this.allVessels);
        this.addVesselMarkers();
      },
      error: (err) => console.error("Failed to load vessel data:", err),
    });
  }

  private extractAndEmitShipTypes(vessels: Vessel[]): void {
    const shipTypeCounts: {
      [key: string]: { formattedType: string; count: number };
    } = {};
    vessels.forEach((vessel) => {
      const type = vessel.staticData.shipType;
      if (type) {
        if (!shipTypeCounts[type]) {
          shipTypeCounts[type] = {
            formattedType: this.vesselService.formatShipType(type),
            count: 0,
          };
        }
        shipTypeCounts[type].count++;
      }
    });

    this.shipTypes = Object.entries(shipTypeCounts).map(
      ([originalType, { formattedType, count }]) => ({
        originalType,
        formattedType,
        count,
      })
    );

    this.shipTypesAvailable.emit(this.shipTypes);
  }

  private clearMarkers(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers = []; // Clear the array
  }

  private addVesselMarkers(shipType?: string): void {
    this.clearMarkers();

    let bounds: L.LatLngBounds | null = null;

    this.allVessels.forEach((vessel) => {
      if (!shipType || vessel.staticData.shipType === shipType) {
        const lat = vessel.lastPositionUpdate.latitude;
        const lon = vessel.lastPositionUpdate.longitude;
        const marker = this.addMarker(lat, lon, vessel);
        if (marker) {
          this.markers.push(marker);
          bounds = bounds
            ? bounds.extend(marker.getLatLng())
            : L.latLngBounds(marker.getLatLng(), marker.getLatLng());
        }
      }
    });

    // Fit bounds if there are any markers
    if (bounds && this.map && this.markers.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }

  handleShipTypeChange(newType: string): void {
    this.selectedShipType = newType;
    this.updateMapMarkers();
  }

  handleFilterVisibilityChange(isShown: boolean): void {
    this.showFilters = isShown;
    if (!isShown) {
      // Update map markers when filters are hidden
      this.updateMapMarkers();
    }
  }

  updateMapMarkers(): void {
    this.clearMarkers();
    let bounds: L.LatLngBounds | null = null;

    this.allVessels.forEach((vessel) => {
      if (
        this.selectedShipType === "all" ||
        vessel.staticData.shipType === this.selectedShipType
      ) {
        const lat = vessel.lastPositionUpdate.latitude;
        const lon = vessel.lastPositionUpdate.longitude;
        const marker = this.addMarker(lat, lon, vessel);
        if (marker) {
          this.markers.push(marker);
          bounds = bounds
            ? bounds.extend(marker.getLatLng())
            : L.latLngBounds(marker.getLatLng(), marker.getLatLng());
        }
      }
    });

    if (bounds && this.map && this.markers.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }

  private addMarker(
    lat: number,
    lon: number,
    vessel: Vessel
  ): L.Marker | undefined {
    if (this.map) {
      let randomDelay = (Math.random() * 0.3).toFixed(1); // Generates a random delay up to 0.8 seconds
      const customIcon = L.divIcon({
        html: `<div class="leaflet-icon-container animated-marker" style="animation-delay: ${randomDelay}s;">
                 <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" version="1.1" viewBox="0 0 90.91 99.02"><defs><style>.cls-2{stroke-width:0;fill:#fff}</style></defs><path d="M90.91 45.45C90.91 20.35 70.56 0 45.45 0S0 20.35 0 45.45c0 21.63 15.12 39.72 35.36 44.31.7.16.1.02.1.02l9.99 9.23 9.64-9.16s-.35.08.3-.07c20.32-4.53 35.52-22.66 35.52-44.35Z" class="cls-2"/><circle cx="45.45" cy="45.45" r="40.24" style="stroke-width:0;fill:#be2025" transform="rotate(-45 45.448 45.455)"/><path d="M32.63 43.69V33.43c0-.89.72-1.6 1.6-1.6h8.02v-3.21h6.41v3.21h8.02c.89 0 1.6.72 1.6 1.6v10.26l1.74.52c.82.25 1.3 1.09 1.09 1.92l-2.43 9.73h-.4c-.93 0-1.82-.16-2.65-.45l2-8.58-12.19-3.8-12.19 3.8 2 8.58c-.83.29-1.72.45-2.65.45h-.4l-2.43-9.73c-.21-.83.27-1.68 1.09-1.92l1.74-.52Zm3.2-.96 9.62-2.89 9.62 2.89v-7.7H35.83v7.7Zm-3.2 16.35c2.46 0 4.71-.93 6.41-2.45 1.7 1.52 3.95 2.45 6.41 2.45s4.71-.93 6.41-2.45a9.596 9.596 0 0 0 6.41 2.45h3.21v3.21h-3.21c-2.34 0-4.53-.62-6.41-1.72-1.89 1.09-4.08 1.72-6.41 1.72s-4.53-.62-6.41-1.72a12.799 12.799 0 0 1-6.41 1.72h-3.21v-3.21h3.21Z" class="cls-2"/></svg>
                 <span>${vessel.staticData.name}</span>
               </div>`,
        className: "custom-marker",
        iconAnchor: [19, 60],
        popupAnchor: [220, 120],
      });

      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(this.map);

      marker.on("click", () => {
        const icon = (marker as any)._icon;
        if (icon) {
          icon.classList.add("enlarged-marker");
        }
      });

      // Resize marker when popup is opened and then closed
      marker
        .bindPopup(this.generatePopupContent(vessel), {
          closeButton: true,
          className: "custom-popup",
        })
        .on("popupopen", (e) => {
          const icon = e.target._icon;
          if (icon) {
            icon.classList.add("enlarged-marker");
          }
        })
        .on("popupclose", (e) => {
          const icon = e.target._icon;
          if (icon) {
            icon.classList.remove("enlarged-marker");
          }
        });

      return marker;
    }
    return undefined; // Return undefined if map is not initialized
  }

  private generatePopupContent(vessel: Vessel): string {
    const formattedShipType = this.vesselService.formatShipType(
      vessel.staticData.shipType || "Unknown"
    );
    return `
    <div class="vessel-popup">
    <div class="vessel-popup__header">
        <span class="vessel-popup__header-country">${
          vessel.staticData.flag
        }</span>
        <div class="vessel-popup__title-wrapper">
            <h2 class="vessel-popup__title">${vessel.staticData.name}</h2>
            <span class="vessel-popup__ship-type">${formattedShipType}</span>
        </div>
    </div>

    <div class="vessel-popup__content">
        <div class="vessel-popup__column vessel-popup__column--left">
            <div class="vessel-popup__item">
                <span class="vessel-popup__label">Call Sign:</span>
                <span class="vessel-popup__value">${
                  vessel.staticData.callsign
                }</span>
            </div>
            <div class="vessel-popup__item">
                <span class="vessel-popup__label">MMSI:</span>
                <span class="vessel-popup__value">${
                  vessel.staticData.mmsi
                }</span>
            </div>
            <div class="vessel-popup__item">
                <span class="vessel-popup__label">IMO:</span>
                <span class="vessel-popup__value">${
                  vessel.staticData.imo
                }</span>
            </div>
        </div>

        <div class="vessel-popup__column vessel-popup__column--right">
            <div class="vessel-popup__item vessel-popup__item--dimensions">
                <span class="vessel-popup__label">Dimensions:</span>
                <div class="vessel-popup__dimensions">
                    <div class="vessel-popup__dimension-item">
                        <span>Length: </span> 
                        <span class="vessel-popup__dimension-value">${
                          vessel.staticData.dimensions.length
                        }m</span>
                    </div>
                    <div class="vessel-popup__dimension-item">
                        <span>Width:</span> 
                        <span class="vessel-popup__dimension-value">${
                          vessel.staticData.dimensions.width
                        }m</span>
                    </div>
                </div>
            </div>
            <div class="vessel-popup__item vessel-popup__item--coordinates">
                <span class="vessel-popup__label">Last Known Position:</span>
                <div class="vessel-popup__position">
                    <div class="vessel-popup__coordinate-item">
                        <span>Lat:</span> 
                        <span class="vessel-popup__coordinate-value">${
                          vessel.lastPositionUpdate.latitude
                        }</span>
                    </div>
                    <div class="vessel-popup__coordinate-item">
                        <span>Long:</span> 
                        <span class="vessel-popup__coordinate-value">${
                          vessel.lastPositionUpdate.longitude
                        }</span>
                    </div>
                </div>
            </div>
            <div class="vessel-popup__item vessel-popup__item--destination">
                <span class="vessel-popup__label">Destination:</span>
                <span class="vessel-popup__value">${
                  vessel.currentVoyage.destination || "N/A"
                }</span>
            </div>
            <div class="vessel-popup__item vessel-popup__item--update">
                <span class="vessel-popup__label">ETA:</span>
                <span class="vessel-popup__value">${
                  vessel.currentVoyage.eta
                    ? new Date(vessel.currentVoyage.eta).toLocaleString()
                    : "N/A"
                }</span>
            </div>
        </div>
    </div>

    <div class="vessel-popup__footer">
        <span class="vessel-popup__label">Last update:</span>
        <span class="vessel-popup__value">${new Date(
          vessel.lastPositionUpdate.timestamp
        ).toLocaleString()}</span>
    </div>
</div>
    `;
  }
}
