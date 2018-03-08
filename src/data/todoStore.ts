import { Guid, deserialize, primitify, hydrate } from '@cashfarm/lang';
import { provide } from '@cashfarm/plow';
import { MysqlStore, Table, TableName, StringField, PK, BooleanField, DateField, TableClass, DtoClass } from '@cashfarm/store';

import { ConnectionPool } from '../db';
import { description } from 'joi';

const debug = require('debug')('todos:store');

export class TodoDto {
  public id: Guid;
  public done: boolean;
  public description: string;
  public createdAt: Date;
}

@TableName('todos')
export class TodosTable extends Table {
  @PK()
  public id = new StringField('id');
  public done = new BooleanField('done');
  public description = new StringField('description');
  public createdAt = new DateField('createdAt');
}

@DtoClass(TodoDto)
@TableClass(TodosTable)
@provide(TodoStore)
export class TodoStore extends MysqlStore<TodosTable, TodoDto> {

  constructor() {
    super(ConnectionPool);
  }

  public findAll(): Promise<TodoDto[]> {
    debug('TodoStore.findAll()');

    return super.find(null)
      .then(todos => {
        debug('Result:', todos);
        debug('Calling deserialize');

        return deserialize(TodoDto, <object[]> todos);
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  }

  public findById(id: Guid | string): Promise<TodoDto> {
    return this.findOne(q => q.where(t => t.id.equals(id.toString()))).then(todo => deserialize(TodoDto, todo));
  }

  public async save(todo: TodoDto): Promise<TodoDto> {
    const oldTodo = await this.findById(todo.id.toString());

    if (oldTodo) {
      return this.update(todo, q => q.where(t => t.id.equals(todo.id.toString())))
        .then(() => todo);
    }

    debug('Saving todo:', todo);

    return super.create(todo).then(() => todo);
  }
}
