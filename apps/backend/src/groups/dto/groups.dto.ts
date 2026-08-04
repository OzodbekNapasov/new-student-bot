import { IsString, IsNotEmpty, IsOptional, IsInt, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ description: 'Group display name (e.g. Computer Science 101)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Unique group code (e.g. CS-101)' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Faculty name', required: false })
  @IsString()
  @IsOptional()
  faculty?: string;

  @ApiProperty({ description: 'Academic year', default: 2024 })
  @IsInt()
  @IsOptional()
  academicYear?: number;

  @ApiProperty({ description: 'Group Leader User ID', required: false })
  @IsUUID()
  @IsOptional()
  leaderId?: string;
}

export class UpdateGroupDto {
  @ApiProperty({ description: 'Group display name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Faculty name', required: false })
  @IsString()
  @IsOptional()
  faculty?: string;

  @ApiProperty({ description: 'Academic year', required: false })
  @IsInt()
  @IsOptional()
  academicYear?: number;

  @ApiProperty({ description: 'Group status (ACTIVE/INACTIVE)', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}

export class AssignLeaderDto {
  @ApiProperty({ description: 'User ID of the assigned Group Leader' })
  @IsUUID()
  @IsNotEmpty()
  leaderId: string;
}
