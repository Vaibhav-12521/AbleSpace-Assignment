import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateResourceDto {
  @IsUrl(
    { require_protocol: true },
    { message: 'Enter a full URL, including https://' },
  )
  @MaxLength(2000)
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;
}
