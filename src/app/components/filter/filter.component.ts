import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { VesselService } from "../../services/vessel.service";

@Component({
  selector: "app-filter",
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: "./filter.component.html",
  styleUrl: "./filter.component.scss",
})
export class FilterComponent {
  @Output() shipTypeChanged = new EventEmitter<string>();
  shipTypes: { formattedType: string, originalType: string, count: number }[] = [];

  constructor(private vesselService: VesselService) {}

  ngOnInit(): void {
    this.loadShipTypes();
  }

  loadShipTypes(): void {
    this.vesselService.getVessels().subscribe({
      next: (data) => {
        this.shipTypes = this.extractShipTypes(data.data.vessels.nodes);
        console.log("Ship types:", this.shipTypes);
      },
      error: (err) => console.error("Failed to load ship types:", err),
    });
  }

  extractShipTypes(vessels: any[]): { formattedType: string, originalType: string, count: number }[] {
    const shipTypeCounts: { [originalType: string]: { count: number, formattedType: string } } = {};
    vessels.forEach((vessel) => {
      const originalType = vessel.staticData.shipType;
      if (originalType) {
        const formattedType = this.vesselService.formatShipType(originalType);
        if (!shipTypeCounts[originalType]) {
          shipTypeCounts[originalType] = { count: 0, formattedType };
        }
        shipTypeCounts[originalType].count++;
      }
    });

    return Object.entries(shipTypeCounts).map(([originalType, { count, formattedType }]) => ({
      formattedType,
      originalType,
      count
    }));
  }

  onShipTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.shipTypeChanged.emit(selectElement.value); 
  }
  
  
}
