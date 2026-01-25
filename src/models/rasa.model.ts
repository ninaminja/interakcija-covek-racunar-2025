export interface RasaModel {
    text: string;
    attachment?: {  // Dodali smo '?' jer attachment nije uvek prisutan
        type: 'toy_list' | 'toy_details' | 'type_list' | 'age_group_list' | 'simple_list' | 'create_order';
        data: any;
    };
    image?: string;  // Dodali smo opciono polje za slike
}

export interface Toy {
    id?: number;
    name: string;
    description?: string;
    price?: number;
    type?: {
        typeId: number;
        name: string;
    };
    ageGroup?: {
        ageGroupId: number;
        name: string;
    };
    permalink?: string;
    imageUrl?: string;
}

export interface ToyType {
    typeId: number;
    name: string;
}

export interface AgeGroup {
    ageGroupId: number;
    name: string;
}