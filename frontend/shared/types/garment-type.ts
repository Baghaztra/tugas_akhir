export interface GarmentType {
  id: number;
  name: string;
  is_deleted: boolean;
  item_count: number;
}

export interface GarmentTypeCreate {
  name: string;
}

export interface GarmentTypeUpdate {
  name: string;
}
