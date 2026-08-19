import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

/**
 * Every create field is optional on update except parentId — re-parenting a
 * task would let a task become its own ancestor, so it is not editable.
 */
export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['parentId'] as const),
) {}
