import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: false,
  templateUrl: './card.html',
  styleUrls: ['./card.scss']
})
export class Card {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() imageUrl = '';
  @Input() actions = false;
}