import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private defaultValuesToHideUser = [
    'Статус аудио',
    'Статус видео',
    'Обработчик',
    'Комментарии',
    'ID',
    'Инстаграм',
    'Текст',
    'BPIUM',
    'Место',
    'Писание',
    'Чтец',
    'Полное описание со временем',
    'Длительность',
    'Раздел Учения'
  ];
  private defaultValuesToHideAdmin= [
    'ID',
    'Инстаграм',
    'Текст',
    'BPIUM',
    'Место',
    'Писание',
    'Чтец',
    'Полное описание со временем',
    'Длительность',
    'Раздел Учения',
    'Название',
    'Автор',
    'Теги',
    'Youtube',
    'advayta.org'
  ];
  constructor() {}
  get defaultValuesUser() {
    return this.defaultValuesToHideUser;
  }
  get defaultValuesAdmin() {
    return this.defaultValuesToHideAdmin;
  }
}
