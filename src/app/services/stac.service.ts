import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface STACItemPreview {
  id: string;
  thumbnailUrl: string;
  downloadUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class StacService {
  constructor(private http: HttpClient) {}

  public getStacItems(extent: number[]): Observable<STACItemPreview[]> {
    return this.http.post<STACItemPreview[]>(
      'http://localhost:8080/api/v1/remote-sensing/stac/items',
      {
        extent: extent,
      }
    );
  }

  public objectDetection(id: string, extent: number[]): Observable<Blob> {
    return this.http.post(
      'http://localhost:8080/api/v1/remote-sensing/stac/object-detection',
      {
        extent: extent,
        id: id,
      },
      {
        responseType: 'blob',
      }
    );
  }

  public treeDetection(id: string, extent: number[]): Observable<Blob> {
    return this.http.post(
      'http://localhost:8080/api/v1/remote-sensing/stac/tree-detection',
      {
        extent: extent,
        id: id,
      },
      {
        responseType: 'blob',
      }
    );
  }
}
