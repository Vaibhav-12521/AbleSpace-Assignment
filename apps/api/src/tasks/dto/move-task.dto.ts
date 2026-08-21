import { IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MoveTaskDto {
  @IsString()
  statusId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  position!: number;
}
