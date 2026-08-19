import { IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/** Payload for a board drag-and-drop: which column, and where in it. */
export class MoveTaskDto {
  @IsString()
  statusId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  position!: number;
}
