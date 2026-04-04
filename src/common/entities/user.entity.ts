import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Peer } from './peer.entity';
import { UserPresence } from './user-presence.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 80 })
  name!: string;

  @Column({ unique: true, nullable: true })
  email!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ select: false })
  @Exclude()
  password!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ default: false })
  isVerified: boolean = false;

  @OneToOne(() => Profile, { cascade: ['insert', 'update'] })
  @JoinColumn()
  profile: Profile | undefined;

  @OneToOne(() => Peer, { cascade: ['insert', 'remove', 'update'] })
  @JoinColumn()
  peer: Peer | undefined;

  @OneToOne(() => UserPresence, { cascade: ['insert', 'update'] })
  @JoinColumn()
  presence: UserPresence | undefined;
}
