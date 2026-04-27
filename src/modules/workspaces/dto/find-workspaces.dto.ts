import { IsOptional } from 'class-validator';

export class FindWorkspacesDto {
  @IsOptional()
  search: string;
}
