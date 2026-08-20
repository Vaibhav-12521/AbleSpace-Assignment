import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { QueryTasksDto } from './query-tasks.dto';

/** Collects the failing property names so assertions read clearly. */
async function failingFields(dto: object) {
  const errors = await validate(dto, { whitelist: true });
  return errors.map((error) => error.property);
}

describe('CreateTaskDto', () => {
  it('accepts a minimal task', async () => {
    const dto = plainToInstance(CreateTaskDto, {
      title: 'Write API Documentation',
      statusId: 'status-1',
    });

    expect(await failingFields(dto)).toEqual([]);
  });

  it('rejects an empty title', async () => {
    const dto = plainToInstance(CreateTaskDto, {
      title: '   '.trim(),
      statusId: 'status-1',
    });

    expect(await failingFields(dto)).toContain('title');
  });

  it('requires a status', async () => {
    const dto = plainToInstance(CreateTaskDto, { title: 'Orphan' });

    expect(await failingFields(dto)).toContain('statusId');
  });

  it('rejects an unknown priority', async () => {
    const dto = plainToInstance(CreateTaskDto, {
      title: 'Task',
      statusId: 'status-1',
      priority: 'SOMEDAY',
    });

    expect(await failingFields(dto)).toContain('priority');
  });

  it('rejects a due date that is not a date string', async () => {
    const dto = plainToInstance(CreateTaskDto, {
      title: 'Task',
      statusId: 'status-1',
      dueDate: 'next tuesday',
    });

    expect(await failingFields(dto)).toContain('dueDate');
  });

  it('rejects duplicate assignees', async () => {
    const dto = plainToInstance(CreateTaskDto, {
      title: 'Task',
      statusId: 'status-1',
      assigneeIds: ['user-1', 'user-1'],
    });

    expect(await failingFields(dto)).toContain('assigneeIds');
  });
});

describe('QueryTasksDto', () => {
  it('splits comma-separated ids into an array', async () => {
    const dto = plainToInstance(QueryTasksDto, {
      statusIds: 'a,b,c',
    });

    expect(dto.statusIds).toEqual(['a', 'b', 'c']);
    expect(await failingFields(dto)).toEqual([]);
  });

  it('accepts a repeated query key already parsed as an array', async () => {
    const dto = plainToInstance(QueryTasksDto, {
      priorities: ['HIGH', 'LOW'],
    });

    expect(dto.priorities).toEqual(['HIGH', 'LOW']);
    expect(await failingFields(dto)).toEqual([]);
  });

  it('treats an empty string as absent rather than as one empty id', async () => {
    const dto = plainToInstance(QueryTasksDto, { labelIds: '' });

    expect(dto.labelIds).toBeUndefined();
    expect(await failingFields(dto)).toEqual([]);
  });

  it('rejects an unknown due-date preset', async () => {
    const dto = plainToInstance(QueryTasksDto, { due: 'yesterday' });

    expect(await failingFields(dto)).toContain('due');
  });
});
