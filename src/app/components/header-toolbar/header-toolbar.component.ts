import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostBinding
} from '@angular/core';
import { ICities } from '../../models/cities.model';
import {
  ActivatedRoute,
  Router,
  ChildActivationEnd,
  NavigationEnd
} from '@angular/router';
import { MediaObserver } from '@angular/flex-layout';
import { filter, switchMap, map } from 'rxjs/operators';
import { combineLatest, Subscription, of } from 'rxjs';
import { CitiesService } from '../../services/cities.service';
import { ConstantsService } from '../../services/constants.service';
import { ErrorsService } from '../../services/errors.service';
import { HistoryService } from '../../services/history.service';
import { AppErrorPayloadModel } from '../../states/app.models';
import { DomSanitizer } from '@angular/platform-browser';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  selector: 'app-header-toolbar',
  templateUrl: './header-toolbar.component.html',
  styleUrls: ['./header-toolbar.component.css']
})
export class HeaderToolbarComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatToolbar) matToolbar: MatToolbar;

  @HostBinding('attr.style')
  public get valueAsStyle(): any {
    if (this.matToolbar) {
      this.toolbarHeight = this.matToolbar._elementRef.nativeElement.clientHeight;
    }
    return this._sanitizer.bypassSecurityTrustStyle(
      `--toolbar-height: ${this.toolbarHeight}px`
    );
  }

  toolbarActions: [] = [];
  toolbarShow = true;
  cities: ICities;
  selectedCityId: string = ConstantsService.defaultCityId;
  subscriptions: Subscription;
  showActionButtonsXS = false;
  xs = false;
  toolbarHeight: number;

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _cities: CitiesService,
    private _history: HistoryService,
    private _errors: ErrorsService,
    public mediaObserver: MediaObserver,
    private _sanitizer: DomSanitizer,
  ) {
    const eventNavigationEnd = this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(
        (event: ChildActivationEnd) =>
          event['urlAfterRedirects'].split('/').pop() ||
          event['url'].split('/').pop()
      ),
      filter(eventPathEndSegment => !!eventPathEndSegment)
    );
    this.subscriptions = combineLatest([
      this._activatedRoute.data,
      eventNavigationEnd
    ])
      .pipe(
        switchMap(([activatedRouteData, eventPathEndSegment]) => {
          if (
            eventPathEndSegment in activatedRouteData.toolbarActions &&
            this.toolbarActions !==
              activatedRouteData.toolbarActions[eventPathEndSegment]
          ) {
            this.toolbarActions =
              activatedRouteData.toolbarActions[eventPathEndSegment];
            this.toolbarShow = true;
            const hasSelectCities = this.toolbarActions.some(
              action => action['type'] === 'selectCities'
            );
            return (
              (hasSelectCities && !this.cities && this._cities.getData()) ||
              of(null)
            );
          }
          this.toolbarShow = false;
          return of(null);
        })
      )
      .subscribe(
        cities => {
          if (cities) {
            this.cities = cities;
            this.selectionChange(null);
          }
        },
        err => {
          this.addError('ngOnInit: onChange: subscribe', err.message);
        }
      );
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.toolbarHeight = this.matToolbar._elementRef.nativeElement.clientHeight;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  isXs() {
    return this.mediaObserver.isActive('xs');
  }

  toggleActionButtonsXS($event: any) {
    this.showActionButtonsXS =
      this.isXs() && this.showActionButtonsXS ? false : true;
  }

  hideActionButtonsXS($event) {
    this.showActionButtonsXS = false;
  }

  selectionChange(eventSelectedCityId) {
    this.selectedCityId = eventSelectedCityId || this.selectedCityId;
    const historyLog = {
      cityId: this.selectedCityId,
      cityName: this.cities[this.selectedCityId].name,
      countryISO2: this.cities[this.selectedCityId].iso2
    };
    this._history.add(historyLog);
  }

  addError(custom: string, errorMessage: string) {
    const errorLog: AppErrorPayloadModel = {
      userMessage: 'Connection or service problem. Please reload or try later.',
      logMessage: `ForecastComponent: ${custom}: ${errorMessage}`
    };
    this._errors.add(errorLog);
  }
}
