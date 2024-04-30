import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: "root",
})
export class VesselService {

  constructor(private http: HttpClient) {}

  // Use a relative URL for the GraphQL endpoint
  getVessels(flag?: string[], shipType?: string[]): Observable<any> {
    return this.http.post(
      "/graphql",
      {
        query: `
        query GetVessels($flag: [String!], $shipType: [ShipType!]) {
          vessels(first: 50, flag: $flag, shipType: $shipType) {
            nodes {
              id
              staticData {
                name
                mmsi
                imo
                aisClass
                flag
                callsign
                dimensions {
                  length
                  width
                }
                shipType
              }
              lastPositionUpdate {
                timestamp
                latitude
                longitude
                collectionType
              }
              currentVoyage {
                destination
                draught
                eta
                updateTimestamp
              }
            }
          }
        }
        `,
        variables: {
          flag: flag,
          shipType: shipType
        }
      },
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization: `Bearer ${environment.bearerToken}`,
        }),
      }
    );
  }

  formatShipType(shipType: string): string {
    return shipType.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}
