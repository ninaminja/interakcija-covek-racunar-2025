import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToyService } from '../../services/toy.service';
import { ReviewService } from '../../services/review.service';
import { ToyModel } from '../../models/toy.model';
import { ReviewModel } from '../../models/review.model';
import { DatePipe } from '@angular/common';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toy',
  imports: [RouterLink, DatePipe, NgClass, FormsModule],
  templateUrl: './toy.html',
  styleUrl: './toy.css'
})
export class Toy implements OnInit {

  protected toy = signal<ToyModel | null>(null);
  protected reviews = signal<ReviewModel[]>([]);
  protected averageRating = signal<number>(0);
  
  // Uklonite ratingStats() jer ga ne koristimo u jednostavnoj verziji
  // protected ratingStats = signal<any[]>([]);
  
  // Forma za recenziju
  protected reviewForm = {
    userName: '',
    rating: 0,
    comment: '',
    showForm: false
  };
  
  protected totalReviews = signal<number>(0);

  constructor(
    private route: ActivatedRoute,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      if (p['path']) {
        ToyService.getToyByPermaLink(p['path'])
          .then(rsp => {
            this.toy.set(rsp.data);
            
            if (rsp.data?.toyId) {
              this.loadReviews(rsp.data.toyId);
            }
          });
      }
    });
  }

  private loadReviews(toyId: number): void {
    const reviews = this.reviewService.getReviewsByToyId(toyId);
    this.reviews.set(reviews);
    this.totalReviews.set(reviews.length);
    
    const avg = this.reviewService.calculateAverageRating(reviews);
    this.averageRating.set(avg);
  }

  protected setRating(rating: number): void {
    this.reviewForm.rating = rating;
  }

  protected submitReview(): void {
    const toy = this.toy();
    if (!toy || !this.reviewForm.comment.trim() || this.reviewForm.rating === 0) {
      alert('Molimo unesite ocenu i komentar.');
      return;
    }

    try {
      const newReview = this.reviewService.addReview(
        toy.toyId,
        this.reviewForm.userName.trim(),
        this.reviewForm.rating,
        this.reviewForm.comment.trim()
      );
      
      // Dodaj novu recenziju u listu
      this.reviews.update(reviews => [...reviews, newReview]);
      this.totalReviews.update(count => count + 1);
      
      // Izračunaj novu prosečnu ocenu
      const updatedReviews = this.reviews();
      const avg = this.reviewService.calculateAverageRating(updatedReviews);
      this.averageRating.set(avg);
      
      // Resetuj formu
      this.reviewForm = {
        userName: '',
        rating: 0,
        comment: '',
        showForm: false
      };
      
      alert('Hvala na recenziji!');
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Došlo je do greške prilikom slanja recenzije.');
    }
  }

  protected toggleReviewForm(): void {
    this.reviewForm.showForm = !this.reviewForm.showForm;
  }
}