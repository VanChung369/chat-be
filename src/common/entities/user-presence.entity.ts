import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserStatus } from '../types';

@Entity({ name: 'user_presences' })
export class UserPresence {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', default: UserStatus.Online })
  status: UserStatus = UserStatus.Online;

  @Column({ type: 'varchar', nullable: true })
  statusMessage?: string;

  @Column({ default: false })
  showOffline: boolean = false;
}
