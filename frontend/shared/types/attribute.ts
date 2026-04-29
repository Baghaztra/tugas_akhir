export interface Attribute {
  id: number;
  name: string;
  is_deleted: boolean;
}

export interface AttributeCreate {
  name: string;
}
