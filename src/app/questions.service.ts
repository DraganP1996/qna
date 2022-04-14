import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Question } from './question.model';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  lockeId$ = this._socket.fromEvent<string>('sendLockedId');
  unlockeId$ = this._socket.fromEvent<string>('sendUnlockedId');

  constructor(private _http: HttpClient, private _socket: Socket) { }

  /**
   * Get the list of questions
   * @returns 
   */
  getQuestions(): Observable<Question[]>{
    return this._http.get<Question[]>(environment.apiURL+'questions/list')
  }

  /**
   * Add a new question
   * @param question 
   * @returns 
   */
  addQuestion(question: Question): Observable<Question> {
    return this._http.put<Question>(environment.apiURL+'questions/add', question);
  }

  /**
   * Edit existing question
   * @param question 
   * @returns 
   */
  editQuestion(question: Question): Observable<Question> {    
    return this._http.post<Question>(environment.apiURL+'questions/edit', question);
  }

  /**
   * Delete specific question
   * @param id 
   * @returns 
   */
  deleteQuestion(id: string): Observable<any> {
    return this._http.delete<Question>(environment.apiURL+'questions/delete/'+id);
  }

  lockQuestionWhildeEditing(id: string): void {
    this._socket.emit('lockEditForQuestion', id);
  }

  unlockQuestionWhildeEditing(id: string): void {
    this._socket.emit('unlockEditForQuestion', id);
  }
}
