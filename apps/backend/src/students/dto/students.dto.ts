import { IsString, IsNotEmpty, IsOptional, IsEmail, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ description: 'Student first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Student last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Group ID where student belongs' })
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ description: 'Student email address', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Student Telegram User ID', required: false })
  @IsString()
  @IsOptional()
  telegramId?: string;

  @ApiProperty({ description: 'Student card number (e.g. ST-1001)', required: false })
  @IsString()
  @IsOptional()
  studentCardNumber?: string;

  @ApiProperty({ description: 'Gender (MALE/FEMALE)', required: false })
  @IsString()
  @IsOptional()
  gender?: string;
}

export class UpdateStudentDto {
  @ApiProperty({ description: 'Student first name', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Student last name', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'Student status (ACTIVE/EXPELLED/GRADUATED)', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Student card number', required: false })
  @IsString()
  @IsOptional()
  studentCardNumber?: string;
}

export class TransferStudentDto {
  @ApiProperty({ description: 'Target Group ID to transfer student into' })
  @IsUUID()
  @IsNotEmpty()
  targetGroupId: string;
}
