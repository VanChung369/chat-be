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

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 80 })
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => Profile, { cascade: ['insert', 'update'] })
  @JoinColumn()
  profile: Profile;

  @OneToOne(() => Peer, { cascade: ['insert', 'remove', 'update'] })
  @JoinColumn()
  peer: Peer;
}
