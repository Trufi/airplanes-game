import { City } from './types';

export const healPointsByCity: { [key in City]: number[][] } = {
  nsk: [
    [989329080, 789625871], // Оперный
    [988990162, 789736310], // Вокзал
    [989345854, 789964008], // Повыше Гелереи
    [989013840, 788583552], // Сан-Сити
    [989787138, 788478977], // Бугринский мост
  ],
  tomsk: [
    [1013461871, 820525755], // Театр
    [1013654726, 820704137], // Белое озеро
    [1013513214, 819796304],
    [1014236495, 820209301],
  ],
  omsk: [
    [875534233, 787751377], // Омск пригород
    [875950798, 788362857], // 40 лет
    [875355666, 788741910],
    [874646723, 788638752],
  ],
  kemerovo: [
    [1026843811, 796495912],
    [1027025811, 795920464],
    [1027724411, 796034692],
    [1027780280, 796597813],
  ],
  barnaul: [
    [999083056, 755159724],
    [999616800, 755690065],
    [998965225, 756139298],
    [999627736, 754826970],
  ],
  krasnoyarsk: [
    [1107503379, 810182629],
    [1107859600, 810560191],
    [1108273819, 810331773],
    [1108042745, 809962163],
  ],
};

export const originByCity: { [key in City]: number[] } = {
  nsk: [989279049, 789621208],
  omsk: [875446967, 788288755],
  tomsk: [1013559686, 820529938],
  kemerovo: [1026981292, 796407849],
  barnaul: [999501516, 755176970],
  krasnoyarsk: [1108005417, 810291456],
};

export const cityOrder: City[] = ['nsk', 'tomsk', 'krasnoyarsk', 'omsk', 'barnaul', 'kemerovo'];
