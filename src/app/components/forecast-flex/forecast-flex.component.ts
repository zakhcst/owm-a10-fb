import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ConstantsService } from '../../services/constants.service';
import { ITimeTemplate } from '../../models/hours.model';
import { ErrorsService } from '../../services/errors.service';

import { Select } from '@ngxs/store';
import { IOwmDataModel, IListByDateModel } from '../../models/owm-data.model';
import { AppOwmDataState, AppStatusState } from 'src/app/states/app.state';
import { AppErrorPayloadModel } from '../../states/app.models';
import { DataCellExpandedComponent } from '../data-cell-expanded/data-cell-expanded.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-forecast-flex',
  templateUrl: './forecast-flex.component.html',
  styleUrls: ['./forecast-flex.component.css'],
  animations: [
    trigger('showTimeSlot', [
      transition(':enter', [
        query(':enter', [style({ opacity: 0 }), stagger('0.1s', [animate('0.3s', style({ opacity: 1 }))])], {
          optional: true,
        }),
      ]),
    ]),
  ],
})
export class ForecastFlexComponent implements OnInit, OnDestroy {
  @ViewChild('gridContainer', { static: false }) gridContainer: ElementRef;

  timeTemplate: ITimeTemplate[] = ConstantsService.timeTemplate;
  cardBackground: string;
  dateColumnTextColor: string;

  loadingOwmData = true;

  weatherData: IOwmDataModel;
  listByDateLength = 0;
  scrollbarHeight = 0;
  listByDate: IListByDateModel;
  threeDayForecast = false;
  subscriptions: Subscription;

  @Select(AppOwmDataState.selectOwmData) owmData$: Observable<IOwmDataModel>;
  @Select(AppStatusState.threeDayForecast) threeDayForecast$: Observable<boolean>;

  constructor(private _errors: ErrorsService, public dialog: MatDialog) {}

  ngOnInit() {
    this.onInit();
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onInit() {
    this.loadingOwmData = true;
    this.subscriptions = this.owmData$.pipe(filter((data) => !!data)).subscribe(
      (data) => {
        this.weatherData = data;
        this.listByDate = data.listByDate;
        this.listByDateLength = Object.keys(this.weatherData.listByDate).length;
        this.loadingOwmData = false;
      },
      (err) => {
        this.loadingOwmData = false;
        this.addError('ngOnInit: onChange: subscribe', err.message);
      }
    );

    const threeDayForecastSubscription = this.threeDayForecast$.subscribe((threeDayForecast) => {
      this.threeDayForecast = threeDayForecast;
    });
    this.subscriptions.add(threeDayForecastSubscription);
  }

  onMouseWheel(event: any) {
    if (this.gridContainer && !event.shiftKey) {
      const frames = 20;
      const step = event.deltaY/frames;
      let count = 0;
      const interval = setInterval(() => {
        this.gridContainer.nativeElement.scrollLeft += step;
        if (++count >= frames) { clearInterval(interval); }
      }, 10);
    }
  }

  trackByIdFn(index: any, item: any) {
    return index;
  }

  showDataCellExpanded(timeSlotData) {
    if (timeSlotData) {
      this.dialog.open(DataCellExpandedComponent, {
        data: { timeSlotData },
        panelClass: 'data-cell-expanded',
        hasBackdrop: true,
      });
    }
  }

  addError(custom: string, errorMessage: string) {
    const errorLog: AppErrorPayloadModel = {
      userMessage: 'Connection or service problem. Please reload or try later.',
      logMessage: `ForecastFlexComponent: ${custom}: ${errorMessage}`,
    };
    this._errors.add(errorLog);
  }
}
