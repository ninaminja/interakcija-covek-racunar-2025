export interface ReviewModel {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  toyId: number;
}