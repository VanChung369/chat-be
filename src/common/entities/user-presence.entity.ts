import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user_presences' })
export class UserPresence {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true })
  statusMessage?: string;

  @Column({ default: false })
  showOffline: boolean = false;
}

