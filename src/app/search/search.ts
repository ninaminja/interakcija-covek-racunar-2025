import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { NgIf, NgFor, CurrencyPipe, DatePipe } from '@angular/common';
import { ToyService } from '../../services/toy.service';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { ToyModel } from '../../models/toy.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    MatTableModule,
    NgIf,
    NgFor,
    MatButtonModule,
    RouterLink,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    FormsModule,
    MatSelectModule
    //CurrencyPipe
   // DatePipe
  ],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class SearchComponent {
  displayedColumns: string[] = ['name', 'targetGroup', 'ageGroup', 'type', 
                                'productionDate', 'price', 'actions'];
  dataSource: ToyModel[] = [];
  allData: ToyModel[] = [];
  
  toyNameList: string[] = [];
  selectToy: string | null = null;
  
  targetGroupList: string[] = [];
  selectTargetGroup: string | null = null;
  
  ageGroupList: string[] = [];
  selectAgeGroup: string | null = null;
  
  toyTypeList: string[] = [];
  selectToyType: string | null = null;
  
  userInput: string = '';
  dateOptions: string[] = [];
  selectDate: string | null = null;

  public constructor() {
    this.loadToys();
  }

  private async loadToys() {
    try {
      const response = await ToyService.getToys();
      this.allData = response.data;
      this.dataSource = [...this.allData];
      this.generateSearchCriteria(this.allData);
    } catch (error) {
      console.error('Error loading toys:', error);
    }
  }

  public generateSearchCriteria(source: ToyModel[]) {
    // Generate unique toy names
    this.toyNameList = source.map(obj => obj.name)
      .filter((name: string, i: number, arr: string[]) => arr.indexOf(name) === i);
    
    // Generate unique target groups
    this.targetGroupList = source.map(obj => obj.targetGroup)
      .filter((group, index, arr) => group && arr.indexOf(group) === index);
    
    // Generate unique age groups
    this.ageGroupList = source.map(obj => obj.ageGroup?.name)
      .filter((name, index, arr) => name && arr.indexOf(name) === index);
    
    // Generate unique toy types
    this.toyTypeList = source.map(obj => obj.type?.name)
      .filter((name, index, arr) => name && arr.indexOf(name) === index);
    
    // Generate unique production dates (just year part for simplicity)
    this.dateOptions = source.map(obj => obj.productionDate)
      .map(date => date.split('-')[0]) // Extract year
      .filter((year, index, arr) => arr.indexOf(year) === index);
  }

  public doReset() {
    this.userInput = '';
    this.selectToy = null;
    this.selectTargetGroup = null;
    this.selectAgeGroup = null;
    this.selectToyType = null;
    this.selectDate = null;
    this.dataSource = [...this.allData];
    this.generateSearchCriteria(this.allData);
  }

  public formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS');
  }

  public doFilterChain() {
    if (!this.allData.length) return;

    this.dataSource = this.allData
      .filter(obj => {
        // Input Field Search
        if (!this.userInput) return true;
        const searchTerm = this.userInput.toLowerCase();
        return obj.name.toLowerCase().includes(searchTerm) ||
               (obj.description && obj.description.toLowerCase().includes(searchTerm)) ||
               (obj.targetGroup && obj.targetGroup.toLowerCase().includes(searchTerm)) ||
               (obj.ageGroup?.name && obj.ageGroup.name.toLowerCase().includes(searchTerm)) ||
               (obj.type?.name && obj.type.name.toLowerCase().includes(searchTerm));
      })
      .filter(obj => {
        // Toy Name Search
        if (!this.selectToy) return true;
        return obj.name === this.selectToy;
      })
      .filter(obj => {
        // Target Group Search
        if (!this.selectTargetGroup) return true;
        return obj.targetGroup === this.selectTargetGroup;
      })
      .filter(obj => {
        // Age Group Search
        if (!this.selectAgeGroup) return true;
        return obj.ageGroup?.name === this.selectAgeGroup;
      })
      .filter(obj => {
        // Toy Type Search
        if (!this.selectToyType) return true;
        return obj.type?.name === this.selectToyType;
      })
      .filter(obj => {
        // Date Search (by year)
        if (!this.selectDate) return true;
        return obj.productionDate.startsWith(this.selectDate);
      });

    this.generateSearchCriteria(this.dataSource);
  }
}