import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, of, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class VesselService {
  private apiUrl = "https://api.spire.com/graphql"; // GraphQL API endpoint

  constructor(private http: HttpClient) {}

  // Use a relative URL for the GraphQL endpoint
  getVessels(): Observable<any> {
    return this.http.post(
      "/graphql",
      {
        query: `
      {
        vessels(first: 5) {
          nodes {
            id
            staticData {
              name
              mmsi
              imo
            }
            lastPositionUpdate {
              timestamp
              latitude
              longitude
              collectionType
            }
          }
        }
      }
    `,
        variables: {},
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
