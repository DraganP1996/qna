import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Question, QuestionEditSettings, QuestionExpandedSettings } from './question.model';
import { QuestionsService } from './questions.service';
import { take, takeUntil } from 'rxjs/operators';
import { QuestionGroup } from './questions.gruop';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'qna';
  questions: Question[];

  edit: QuestionEditSettings;

  expandedSettings: QuestionExpandedSettings = {};
  form: FormGroup;

  lockedIds = [];

  private readonly _unsubscribe$ = new Subject();

  constructor(
    private _questionService: QuestionsService, 
    private _questionGrup: QuestionGroup) 
    {
    this.form = this._questionGrup.createQuestionForm();
  }

  ngOnInit() {
    this._questionService.getQuestions()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((questions: Question[]) => {
        this.questions = questions;
        this.questions.forEach(question => this.expandedSettings[question._id] = false);
      });

    this._questionService.lockeId$
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(id => {
        if (!this.edit || this.edit.questionId !== id) {
          this.lockedIds.push(id);
        }
      });

      this._questionService.unlockeId$
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(id =>{ 
        this.lockedIds = this.lockedIds.filter(lockedId => lockedId !== id);
      });
  }

  submitQuestion(): void {
    const question = this.form.value;

    this._questionService.addQuestion(question)
      .pipe(take(1))
      .subscribe((question: Question) => {
        this.form.reset();
        this.form.get('order').patchValue(0);
        this.questions.push(question);
      });
  }

  deleteQuestion(id: string): void {
    this._questionService.deleteQuestion(id)
      .pipe(take(1))
      .subscribe(() => {
        this.questions = this.questions.filter(question => question._id !== id)
      });
  }

  switchToEditMode(question: Question): void {
    if (!!this.edit) {
      this._questionService.unlockQuestionWhildeEditing(this.edit.questionId)
    }

    this.edit = {
      editMode: true,
      questionId: question._id
    };
    this._questionGrup.setEditForm(question);
    this._questionService.lockQuestionWhildeEditing(question._id);
  }

  editQuestion(): void {
    const question = this.form.value;
    const index = this.questions.findIndex(q => q._id === this.edit.questionId);

    this._questionService.editQuestion({...question, _id: this.edit.questionId})
      .pipe(take(1))
      .subscribe(() => {
        this.form.reset();
        this.form.get('order').patchValue(0);
        this.questions[index] = {...question, _id: this.edit.questionId};
        delete this.edit;
      });
  }


  showAnswer(id: string): void {
    this.expandedSettings[id] = !this.expandedSettings[id];
  }

  exitFromEditMode(): void {
    this.form.reset();
    this.form.get('order').patchValue(0);
    this._questionService.unlockQuestionWhildeEditing(this.edit.questionId);

    delete this.edit;
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}