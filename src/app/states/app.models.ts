import { IOwmDataModel } from '../models/owm-data.model';

export interface HistoryRecordModel {
  cityId: string;
  time: number;
}

export interface IHistoryModel {
  [cityId: string]: IOwmDataModel;
}

export interface AppStatusModel {
  ip: string;
  normalizedIp: string;
  sessionStartTime: number;
  selectedCityId: string;
  timeSlotBgPicture: boolean;
  connected: boolean;
  away: boolean;
  updatesAvailable: boolean;
  liveDataUpdate: boolean;
  daysForecast: number;
}

export interface AppHistoryPayloadModel {
  owmData: IOwmDataModel;
}

export interface ErrorRecordModel {
  logMessage: string;
  time: number;
  ip?: string;
}
export interface AppErrorsStateModel {
  sessionErrors: ErrorRecordModel[];
}

export interface AppErrorPayloadModel {
  userMessage: string;
  logMessage: string;
}
