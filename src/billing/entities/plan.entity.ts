import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: 30 })
  period_days: number;
}
