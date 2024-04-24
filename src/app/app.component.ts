import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { MapComponent } from "./components/map/map.component";

import { HttpClientModule } from '@angular/common/http';
import { VesselService } from './services/vessel.service';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [
        RouterOutlet,
        HeaderComponent,
        MapComponent,
        HttpClientModule
    ]
})

export class AppComponent implements OnInit {
  title = 'Vessel Tracker';

  constructor(private vesselService: VesselService) {}

  ngOnInit() {
    this.vesselService.getVessels().subscribe({
      next: (data) => console.log('Data fetched:', data),
      error: (error) => console.error('Error fetching data:', error)
    });
  }
}
