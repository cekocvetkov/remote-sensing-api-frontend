import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  effect,
  signal,
} from '@angular/core';

import { MapService } from '../services/map.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnChanges {
  @Input() loading: boolean = false;
  @Input() loadedImage: Blob | null = null;
  @Input() currentExtent: number[] = [];
  @Output() drawEnd$ = this.mapService.drawEnd$;
  constructor(private mapService: MapService) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loadedImage']) {
      console.log(this.currentExtent);
      this.mapService.setSource(this.loadedImage, this.currentExtent);
    }
  }

  ngOnInit(): void {}
}
