import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SentinelService {
  constructor(private http: HttpClient) {}

  getSentinelGeoTiff(
    extent: number[],
    dateFrom: string,
    dateTo: string,
    cloudCoverage: number
  ): Observable<Blob> {
    console.log('Getting sentinel tiff from processing api with ');
    console.log(dateFrom);
    console.log(dateTo);
    console.log(cloudCoverage);
    return this.http.post(
      `http://localhost:8080/api/v1/sentinel`,
      {
        extent: extent,
        dateFrom: dateFrom,
        dateTo: dateTo,
        cloudCoverage: cloudCoverage,
      },
      { responseType: 'blob' }
    );
  }

  classifyGeoTiff(
    extent: number[],
    dateFrom: string,
    dateTo: string,
    cloudCoverage: number
  ): Observable<string> {
    console.log('Classifying GeoTiff... ');
    console.log(dateFrom);
    console.log(dateTo);
    console.log(cloudCoverage);
    return this.http.post(
      `http://localhost:8080/api/v1/sentinel/classify`,
      {
        extent: extent,
        dateFrom: dateFrom,
        dateTo: dateTo,
        cloudCoverage: cloudCoverage,
      },
      { responseType: 'text' }
    );
  }

  objectDetection(
    extent: number[],
    dateFrom: string,
    dateTo: string,
    cloudCoverage: number
  ): Observable<Blob> {
    console.log('Object Detection for GeoTiff... ');
    console.log(dateFrom);
    console.log(dateTo);
    console.log(cloudCoverage);
    return this.http.post(
      `http://localhost:8080/api/v1/sentinel/od`,
      {
        extent: extent,
        dateFrom: dateFrom,
        dateTo: dateTo,
        cloudCoverage: cloudCoverage,
      },
      { responseType: 'blob' }
    );
  }
}
