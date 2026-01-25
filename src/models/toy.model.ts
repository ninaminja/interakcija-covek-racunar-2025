import { TypeModel } from "./type.model"

export interface ToyModel {
    toyId: number
    name: string
    permalink: string
    description: string
    targetGroup: string
    productionDate: string
    price: number
    imageUrl: string
    ageGroup: {
      ageGroupId: number
      name: string
      description: string
    }
    type: TypeModel
  
  }[]