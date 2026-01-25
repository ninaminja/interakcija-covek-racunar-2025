import { Injectable } from '@angular/core';
import { ReviewModel } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  
  private readonly REVIEWS_KEY = 'toy_reviews';

  getReviewsByToyId(toyId: number): ReviewModel[] {
    const reviews = this.getAllReviews();
    return reviews.filter(review => review.toyId === toyId);
  }

  getAllReviews(): ReviewModel[] {
    const reviewsJson = localStorage.getItem(this.REVIEWS_KEY);
    if (reviewsJson) {
      const reviews = JSON.parse(reviewsJson);
      return reviews.map((review: any) => ({
        ...review,
        createdAt: new Date(review.createdAt)
      }));
    }
    return [];
  }

  addReview(toyId: number, userName: string, rating: number, comment: string): ReviewModel {
    const reviews = this.getAllReviews();
    const newId = reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1;
    
    const newReview: ReviewModel = {
      id: newId,
      toyId: toyId,
      userName: userName || 'Anonimni korisnik',
      rating: rating,
      comment: comment,
      createdAt: new Date()
    };
    
    reviews.push(newReview);
    localStorage.setItem(this.REVIEWS_KEY, JSON.stringify(reviews));
    return newReview;
  }

  calculateAverageRating(reviews: ReviewModel[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }
}