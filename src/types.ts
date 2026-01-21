// 类别现在是动态的，不再是固定类型
export type VisitPurpose = string

export interface CityVisit {
  city: string
  purpose: VisitPurpose
  date: string
}

export interface CityData {
  city: string
  purpose: VisitPurpose
  count: number
  firstVisitDate: string
}

export interface PurposeConfig {
  name: string
  color: string
}

