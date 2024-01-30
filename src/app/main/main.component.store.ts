import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  Observable,
  catchError,
  of,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { SentinelService } from '../services/sentinel.service';
import { MapService } from '../services/map.service';
import { SentinelRequest } from './main.component';

export interface STACItemPreview {
  id: string;
  thumbnailUrl: string;
  downloadUrl: string;
}

export interface MainState {
  selectedItem: Blob | null;
  currentExtent: number[];
  items: STACItemPreview[];
  class: string;
  loading: boolean;
  objectDetectionImageUrl: string | null;
  error: string | null;
}

export const initialState: MainState = {
  selectedItem: null,
  currentExtent: [],
  items: [],
  class: '',
  loading: false,
  objectDetectionImageUrl: null,
  error: null,
};

@Injectable()
export class MainStore extends ComponentStore<MainState> {
  constructor(private sentinelService: SentinelService) {
    super(initialState);
  }

  private loading$ = this.select((state) => state.loading);
  private error$ = this.select((state) => state.error);
  private items$ = this.select((state) => state.items);
  private class$ = this.select((state) => state.class);
  private selectedItem$ = this.select((state) => state.selectedItem);
  private currentExtent$ = this.select((state) => state.currentExtent);
  private objectDetectionImageUrl$ = this.select(
    (state) => state.objectDetectionImageUrl
  );

  public vm$ = this.select({
    loading: this.loading$,
    error: this.error$,
    items: this.items$,
    class: this.class$,
    selectedItem: this.selectedItem$,
    currentExtent: this.currentExtent$,
    objectDetectionImageUrl: this.objectDetectionImageUrl$,
  });

  private setLoading = this.updater((state, isLoading: boolean) => ({
    ...state,
    loading: isLoading,
  }));

  private setObjectDetectionImageUrl = this.updater(
    (state, newObjectDetectionImageUrl: string) => ({
      ...state,
      objectDetectionImageUrl: newObjectDetectionImageUrl,
    })
  );

  private setError = this.updater((state, errorMessage: string) => ({
    ...state,
    loading: false,
    error: errorMessage,
  }));

  private setItems = this.updater((state, items: STACItemPreview[]) => ({
    ...state,
    loading: false,
    items: items,
  }));
  private setClass = this.updater((state, classNew: string) => ({
    ...state,
    loading: false,
    class: classNew,
  }));
  private setCurrentExtent = this.updater((state, extent: number[]) => ({
    ...state,
    currentExtent: extent,
  }));
  private setSelectedItem = this.updater((state, item: Blob) => ({
    ...state,
    loading: false,
    selectedItem: item,
  }));
  readonly objectDetection = this.effect(
    (sentinelRequest$: Observable<SentinelRequest>) => {
      console.log(sentinelRequest$);
      return sentinelRequest$.pipe(
        tap((s) => console.log(s)),
        withLatestFrom(this.currentExtent$),
        tap(([sentinelRequest, currentExtent]) =>
          console.log(
            `Object detection for current extent: ${currentExtent}, ${sentinelRequest.dateFrom}, ${sentinelRequest.dateTo}, ${sentinelRequest.cloudCoverage}`
          )
        ),
        tap(() => this.setLoading(true)),
        switchMap(([sentinelRequest, currentExtent]) => {
          return this.sentinelService
            .objectDetection(
              currentExtent,
              sentinelRequest.dateFrom.toString(),
              sentinelRequest.dateTo.toString(),
              sentinelRequest.cloudCoverage
            )
            .pipe(
              tap({
                next: (image: Blob) => {
                  const imageUrl = URL.createObjectURL(image);
                  this.setObjectDetectionImageUrl(imageUrl);
                  this.setLoading(false);
                },
                error: (e) => {
                  this.setError(e);
                },
              }),
              catchError((e) => {
                return of(e);
              })
            );
        })
      );
    }
  );
  readonly classify = this.effect(
    (sentinelRequest$: Observable<SentinelRequest>) => {
      return sentinelRequest$.pipe(
        withLatestFrom(this.currentExtent$),
        tap(([sentinelRequest, currentExtent]) =>
          console.log(
            `Classifying image for current extent: ${currentExtent}, ${sentinelRequest.dateFrom}, ${sentinelRequest.dateTo}, ${sentinelRequest.cloudCoverage}`
          )
        ),
        tap(() => this.setLoading(true)),
        switchMap(([sentinelRequest, currentExtent]) => {
          return this.sentinelService
            .classifyGeoTiff(
              currentExtent,
              sentinelRequest.dateFrom.toString(),
              sentinelRequest.dateTo.toString(),
              sentinelRequest.cloudCoverage
            )
            .pipe(
              tap({
                next: (s) => {
                  console.log(`Image classified as ${s}`);
                  this.setLoading(false);
                  this.setClass(s);
                },
                error: (e) => this.setError(e),
              })
            );
        })
      );
    }
  );
  readonly loadImage = this.effect(
    (sentinelRequest$: Observable<SentinelRequest>) => {
      return sentinelRequest$.pipe(
        tap((sentinelRequest: SentinelRequest) =>
          console.log(
            `Get image for the following request: ${sentinelRequest.extent}, ${sentinelRequest.dateFrom}, ${sentinelRequest.dateTo}, ${sentinelRequest.cloudCoverage}`
          )
        ),
        tap(() => this.setLoading(true)),
        tap((sentinelRequest: SentinelRequest) =>
          this.setCurrentExtent(sentinelRequest.extent!)
        ),
        switchMap((sentinelRequest: SentinelRequest) => {
          return this.sentinelService
            .getSentinelGeoTiff(
              sentinelRequest.extent!,
              sentinelRequest.dateFrom.toString(),
              sentinelRequest.dateTo.toString(),
              sentinelRequest.cloudCoverage
            )
            .pipe(
              tap({
                next: (image: Blob) => this.setSelectedItem(image),
                error: (e) => this.setError(e),
              })
            );
        })
        // withLatestFrom(this.currentExtent$)
        // tap(([_, currentExtent]) =>
        //   console.log(`... and extent ${currentExtent}`)
        // ),
        // switchMap(([itemId, currentExtent]: [string, number[]]) => {
        //   return this.sentinelService
        //     .getSentinelGeoTiff(itemId, currentExtent)
        //     .pipe(
        //       tap({
        //         next: (image: Blob) => this.setSelectedItem(image),
        //         error: (e) => this.setError(e),
        //       })
        //     );
        // })
      );
    }
  );
}
