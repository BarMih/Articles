import { CommonModule } from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {Observable, filter, forkJoin, map, of, switchMap, from, reduce} from 'rxjs';
import 'zone.js';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatTableModule} from "@angular/material/table";

interface Author {
  id: number;
  name: string;
  age: number;
}

interface Article {
  id: number;
  title: string;
  authorId: number;
  isNew: boolean;
}

function getAuthors(): Observable<Author[]> {
  return of([
    { id: 1, name: 'Author1', age: 65 },
    { id: 2, name: 'Author2', age: 87 },
    { id: 3, name: 'Author3', age: 43 },
    { id: 4, name: 'Author4', age: 51 },
    { id: 5, name: 'Author5', age: 35 },
  ]);
}

function getArticles(authorId: number): Observable<Article[]> {
  if (authorId === 1) {
    return of([
      { id: 1, title: 'article1', authorId, isNew: false },
      { id: 2, title: 'article2', authorId, isNew: true },
    ]);
  }
  if (authorId === 2) {
    return of([
      { id: 3, title: 'article3', authorId, isNew: false },
      { id: 4, title: 'article4', authorId, isNew: true },
    ]);
  }
  if (authorId === 3) {
    return of([
      { id: 5, title: 'article5', authorId, isNew: false },
      { id: 6, title: 'article6', authorId, isNew: true },
    ]);
  }
  if (authorId === 4) {
    return of([{ id: 7, title: 'article7', authorId, isNew: false }]);
  }
  return of([]);
}


function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function getManyAuthors(authorsNumber: number): Observable<Set<Author>> {
  let set = new Set<Author>()
  for (let i = 0; i<authorsNumber; i++) {
    set.add({
      id: i,
      name: `Author${i}`,
      age: getRandomInt(20, 80)
    });
  }
  return of(set);
}

function getManyArticles(authorId: number): Observable<Set<Article>> {
  let set = new Set<Article>()
  for (let i = 0; i<getRandomInt(1, 4); i++) {
    set.add({
      id: i,
      title: `article${i}`,
      authorId,
      isNew: !!getRandomInt(0, 1)
    });
  }
  return of(set)
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ScrollingModule, MatTableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">

      <table mat-table [dataSource]="articles" class="mat-elevation-z8">
        
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef> id </th>
          <td mat-cell *matCellDef="let element"> {{element.id}} </td>
        </ng-container>

        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef> title </th>
          <td mat-cell *matCellDef="let element"> {{element.title}} </td>
        </ng-container>

        <ng-container matColumnDef="authorId">
          <th mat-header-cell *matHeaderCellDef> authorId </th>
          <td mat-cell *matCellDef="let element"> {{element.authorId}} </td>
        </ng-container>

        <ng-container matColumnDef="isNew">
          <th mat-header-cell *matHeaderCellDef> isNew </th>
          <td mat-cell *matCellDef="let element"> {{element.isNew}} </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      
<!--      <pre *cdkVirtualFor="let article of articles" class="item">{{article | json }}</pre>-->
    </cdk-virtual-scroll-viewport>

<!--      <pre>{{ articles | json }}</pre>-->
  `,
})
export class App implements OnInit {
  articles: Article[] = [];
  displayedColumns: string[] = ['id', 'title', 'authorId', 'isNew'];

  ngOnInit(): void {
    // получить новые статьи всех авторов, возрастом более 50 лет, используя rxJs
    // .subscribe((articles) => {
    //   this.articles = articles;
    // });


    const age = 50
    const authorNumber = 1_000_0

    getManyAuthors(authorNumber)
        .pipe(
            switchMap(authors => from(authors)
                .pipe(
                    filter(author => author.age > age)
                )
            ),
            switchMap(author => getManyArticles(author.id)
                .pipe(
                    switchMap(articles => from(articles)
                        .pipe(
                            filter(article => article.isNew)
                        )
                    ),
                )
            ),
            map(articles => [articles]),
            reduce((articles, article) => [...articles, ...article]),
        )
        .subscribe(articles => {
          this.articles = articles
          // console.log(articles)
        })

  }

}

bootstrapApplication(App, {
  providers: [provideAnimationsAsync()]
});


// Дополнительное задание
// Сгенерировать 1kk записей
//Создать таблицу с виртуальным скроллом
//Код разместить на GitHub, приложить ссылку.