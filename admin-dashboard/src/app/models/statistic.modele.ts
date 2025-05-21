export interface StatisticType {
    type_id: number;
    name: string;
  }
  
  export interface Statistic {
    statistic_id: number;
    label: string;
    value: number;
    year: number;
    type_id: number;
    type?: StatisticType;
  }
  