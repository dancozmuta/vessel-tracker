import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { VesselService } from "../../services/vessel.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-filter",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: "./filter.component.html",
  styleUrl: "./filter.component.scss",
})
export class FilterComponent implements OnInit {
  @Input() shipTypes: { formattedType: string, originalType: string, count: number }[] = [];
  @Output() shipTypeChanged = new EventEmitter<string>();
  @Input() selectedType: string = '';
  selectedShipType: string = 'all';


  constructor(private vesselService: VesselService) {}

  ngOnInit(): void {
    if (this.shipTypes.length === 0) {
      this.loadShipTypes();
    }
  }

  loadShipTypes(): void {
    this.vesselService.getVessels().subscribe({
      next: (data) => {
        this.shipTypes = this.extractShipTypes(data.data.vessels.nodes);
        if (!this.selectedType) {
          this.shipTypeChanged.emit(this.selectedType);
        }
      },
      error: (err) => console.error("Failed to load ship types:", err)
    });
  }

  extractShipTypes(vessels: any[]): { formattedType: string; originalType: string; count: number }[] {
    const shipTypeCounts: { [key: string]: { count: number; formattedType: string } } = {};
    vessels.forEach((vessel) => {
      const type = vessel.staticData.shipType;
      if (type) {
        shipTypeCounts[type] = shipTypeCounts[type] || { count: 0, formattedType: this.vesselService.formatShipType(type) };
        shipTypeCounts[type].count++;
      }
    });
    return Object.entries(shipTypeCounts).map(([type, info]) => ({
      originalType: type,
      formattedType: info.formattedType,
      count: info.count
    }));
  }

  onShipTypeChange(type: string): void {
    this.selectedType = type;
    this.shipTypeChanged.emit(this.selectedType);
  }

  isSelectedType(type: string): boolean {
    return this.selectedType === type;
  }
}