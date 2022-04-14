import { Injectable } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Question } from "./question.model";

@Injectable({
    providedIn: 'root'
  })
export class QuestionGroup {

    form: FormGroup;

    constructor(private _fb: FormBuilder) {}

    createQuestionForm(): FormGroup {
        this.form = this._fb.group({
            question: ['', [Validators.minLength(5), Validators.maxLength(100), Validators.required]],
            answer: ['', [Validators.minLength(20), Validators.maxLength(400), Validators.required]],
            order: [0],
          });
        
        return this.form;
    }

    setEditForm(questionToEdit: Question): void {
        const { question, answer, order } = questionToEdit;
        
        this.form.get('question').patchValue(question, { emitEvent: true});
        this.form.get('answer').patchValue(answer, { emitEvent: true});
        this.form.get('order').patchValue(order, { emitEvent: true});
    }


}