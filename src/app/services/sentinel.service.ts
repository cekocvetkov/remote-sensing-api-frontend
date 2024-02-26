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

  bingObjectDetection(img: string, model: string): Observable<Blob> {
    const formData = this.constructFormData(img, model);
    return this.http.post(`http://localhost:8080/api/v1/sentinel/bing/detection`, formData, {responseType: 'blob'});
  }

  private constructFormData(base64Img: string, model: string) {
    base64Img = base64Img.replace('data:image/png;base64,', '');
    // Decode base64 string to Blob
    const byteCharacters = atob(base64Img);
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
    formData.append('model', model)
    return formData;
  }
}
