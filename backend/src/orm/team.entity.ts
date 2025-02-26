import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany,
    ManyToMany,
    ManyToOne,
} from 'typeorm';   
  
import { User } from './user.entity';
  
import { PrivacyTeam, StatusTeam } from 'src/common/types'; 
import { Portfolio } from './portfolio.entity';
import { Project } from './project.entity';

@Entity()
export class Team {
  
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;
    
    @Column({ default: '' })
    description: string;
    
    @Column({ default: PrivacyTeam.open})
    privacy: PrivacyTeam;

    @Column({ default: StatusTeam.searchProject })
    status: StatusTeam;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    
    @OneToMany(() => User, (user) => user.team)
    user: User[];

    @OneToMany(() => Portfolio, (portfolio) => portfolio.team)
    portfolio: Portfolio[];

    @ManyToOne(() => Project, (project) => project.teams, { eager: true, onDelete: 'SET NULL' })
    project: Project;
}