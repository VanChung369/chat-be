import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity({ name: 'conversations' })
@Index(['creator.id', 'recipient.id'], { unique: true })
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  creator!: User;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  recipient!: User;

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: ['insert', 'remove', 'update'],
  })
  @JoinColumn()
  messages!: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: number;

  @OneToOne(() => Message)
  @JoinColumn({ name: 'last_message_sent' })
  lastMessageSent!: Message;

  @UpdateDateColumn({ name: 'updated_at' })
  lastMessageSentAt!: Date;
}
