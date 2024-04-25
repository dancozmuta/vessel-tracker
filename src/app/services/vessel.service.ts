import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, of, tap } from "rxjs";

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
          vessels(first: 15, flag: $flag, shipType: $shipType) {
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
          Authorization: "Bearer UsDcIhrr1wzrVDyksn0NUm47vSgt2zNV",
        }),
      }
    );
  }
}
