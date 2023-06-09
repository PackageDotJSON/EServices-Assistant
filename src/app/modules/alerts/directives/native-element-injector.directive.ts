import { Directive, ElementRef, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[formControlName]',
})
export class NativeElementInjectorDirective implements OnInit {
  constructor(private elementRef: ElementRef, private control: NgControl) {}

  ngOnInit(): void {
    (this.control.control as any).nativeElement = this.elementRef.nativeElement;
  }
}
