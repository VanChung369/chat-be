import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'profiles' })
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', default: '' })
  about?: string;

  @Column({ type: 'varchar', nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', nullable: true })
  banner?: string;

  @OneToOne(() => User)
  user: User | undefined;
}

