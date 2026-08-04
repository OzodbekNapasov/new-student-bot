import { IsString, IsNotEmpty, IsArray, ValidateNested, IsUUID, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum AttendanceStatusEnum {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  EXCUSED = 'EXCUSED',
}

export class SingleAttendanceItemDto {
  @ApiProperty({ description: 'Student ID' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ enum: AttendanceStatusEnum, description: 'Attendance Status' })
  @IsEnum(AttendanceStatusEnum)
  @IsNotEmpty()
  status: AttendanceStatusEnum;
}

export class BulkAttendanceDto {
  @ApiProperty({ description: 'Group ID' })
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ description: 'Date in YYYY-MM-DD format (e.g. 2026-08-04)' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ type: [SingleAttendanceItemDto], description: 'Array of student attendances' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleAttendanceItemDto)
  attendances: SingleAttendanceItemDto[];
}
