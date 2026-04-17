import { IsUUID } from 'class-validator';

export class PresenceTargetDto {
  @IsUUID()
  userId!: string;
}
