import { Component, HostListener, OnInit } from '@angular/core';
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

  // Store edit settinga
  edit: QuestionEditSettings;
  // Store setting about expansion of questions
  expandedSettings: QuestionExpandedSettings = {};
  form: FormGroup;

  // Store the ids of questions locked by other users.
  lockedIds = [];

  private readonly _unsubscribe$ = new Subject();

  constructor(
    private _questionService: QuestionsService, 
    private _questionGrup: QuestionGroup) 
    {
    this.form = this._questionGrup.createQuestionForm();
  }

  @HostListener('window:beforeunload')
  unLockBeforeUnloadPage() {
    if (!!this.edit) {
      this._questionService.unlockQuestion(this.edit.questionId)
    }
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
      .subscribe(id => this.lockedIds.push(id));

      this._questionService.unlockeId$
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(id =>{ 
        this.lockedIds = this.lockedIds.filter(lockedId => lockedId !== id);
      });
  }

  /**
   * Create a new question
   */
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

  /**
   * Delete a specific question
   * @param id 
   */
  deleteQuestion(id: string): void {
    this._questionService.deleteQuestion(id)
      .pipe(take(1))
      .subscribe(() => this.questions = this.questions.filter(question => question._id !== id));
  }

  /**
   * Switch to edit mode, inset question data in the form and lock the question for other users
   * @param question 
   */
  switchToEditMode(question: Question): void {
    if (!!this.edit) {
      this._questionService.unlockQuestion(this.edit.questionId)
    }

    this.edit = {
      editMode: true,
      questionId: question._id
    };
    this._questionGrup.setEditForm(question);
    this._questionService.lockQuestionWhileEditing(question._id);
  }

  /**
   * Edit and unlock question
   */
  editQuestion(): void {
    const question = this.form.value;
    const index = this.questions.findIndex(q => q._id === this.edit.questionId);

    this._questionService.editQuestion({...question, _id: this.edit.questionId})
      .pipe(take(1))
      .subscribe(() => {
        this.questions[index] = {...question, _id: this.edit.questionId};
        this.exitFromEditMode();
      });
  }

  /**
   * Expand/Collapse specific question
   * @param id 
   */
  showAnswer(id: string): void {
    this.expandedSettings[id] = !this.expandedSettings[id];
  }

  /**
   * Exit from edit mode and switch to default mode
   */
  exitFromEditMode(): void {
    this.form.reset();
    this.form.get('order').patchValue(0);
    this._questionService.unlockQuestion(this.edit.questionId);

    delete this.edit;
  }

  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
    this.form.reset();
  }
}