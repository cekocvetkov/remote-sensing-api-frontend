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

  detectObjectsFromBing(img: string): Observable<Blob> {
    const formData = this.constructFormData(img);

    return this.http.post(`http://localhost:8080/api/v1/sentinel/od/bing`, formData, {responseType: 'blob'});
  }

  sendScreenshot(img: string): Observable<Blob> {
    const formData = this.constructFormData(img);

    return this.http.post(`http://localhost:8080/api/v1/sentinel/td`, formData, {responseType: 'blob'});
  }

  private constructFormData(img: string) {
    img = img.replace('data:image/png;base64,', '');
    // Decode base64 string to Blob
    const byteCharacters = atob(img);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: 'image/png'});

    // Create FormData and append the image
    const file = new File([blob], 'image.png');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', 'image.png');
    return formData;
  }
}
