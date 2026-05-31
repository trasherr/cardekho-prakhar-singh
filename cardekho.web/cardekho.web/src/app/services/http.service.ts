import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(
    private router: Router, 
    private http: HttpClient, 
    private ngZone: NgZone
  ) { }

  /**
   * token is optional in most cases as it will automatically added in interceptor
   * @param endpoint: string
   * @param token?: string
   * @returns Observable
   */
  public get<T>(endpoint: string, token?: string): Observable<T> {
    if(token) return this.http.get<T>(endpoint, {headers: {Authorization: `Bearer ${token}`}}).pipe(catchError(this.handleError.bind(this)));
    return this.http.get<T>(endpoint).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * token is optional in most cases as it will automatically added in interceptor
   * @param endpoint: string
   * @param body: any | null 
   * @param token?: string 
   * @returns Observable
   */
  public post<T>(endpoint: string, body: any | null, token?: string): Observable<T> {
    if(token) return this.http.post<T>(endpoint, body, {headers: {Authorization: `Bearer ${token}`}}).pipe(catchError(this.handleError.bind(this)));
    return this.http.post<T>(endpoint, body).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * token is optional in most cases as it will automatically added in interceptor
   * @param endpoint: string
   * @param body: any | null 
   * @param token?: string 
   * @returns Observable
   */
  public put<T>(endpoint: string, body: any | null, token?: string): Observable<T> {
    return this.http.put<T>(endpoint, body, {headers: {Authorization: `Bearer ${token}`}}).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * token is optional in most cases as it will automatically added in interceptor
   * @param endpoint: string
   * @param body: any | null 
   * @param token?: string 
   * @returns Observable
   */
  public patch<T>(endpoint: string, body: any | null, token?: string): Observable<T> {
    return this.http.patch<T>(endpoint, body, {headers: {Authorization: `Bearer ${token}`}}).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * token is optional in most cases as it will automatically added in interceptor
   * @param endpoint: string
   * @param token?: string 
   * @returns Observable
   */
  public delete<T>(endpoint: string, token?: string): Observable<T> {
    if(token) return this.http.delete<T>(endpoint, {headers: {Authorization: `Bearer ${token}`}}).pipe(catchError(this.handleError.bind(this)));
    return this.http.delete<T>(endpoint).pipe(catchError(this.handleError.bind(this)));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    console.log("error stats", error.status);
    
    // if (error.status === 401 || error.status === 403) {
    //   this.ngZone.run(() => {
    //     this.router.navigate(['/login']);
    //   });
    // }

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server-side error: ${error.status} - ${error.message}`;
    }

    console.error(errorMessage);

    // Return an observable with a user-facing error message
    return throwError(() => new Error('Something went wrong, please try again later.'));
  }
}
