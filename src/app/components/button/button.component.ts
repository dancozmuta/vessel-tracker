import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() iconSrc: string | undefined; // Optional icon for the button
  @Input() customClass: string | undefined; // Optional custom class
  @Input() isShown: boolean = true; // Determines initial toggle state
  @Input() showText: string = 'Show'; // Default show text
  @Input() hideText: string = 'Hide'; // Default hide text

  @Output() toggle = new EventEmitter<boolean>(); // Emits the toggle state

  get displayText(): string {
    return (this.isShown ? this.hideText : this.showText) + ' Filters';
  }

  handleClick() {
    this.isShown = !this.isShown;
    this.toggle.emit(this.isShown);
  }
}
