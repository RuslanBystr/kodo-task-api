import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SeederOptions } from 'typeorm-extension';
import { CONFIG } from './src/common/enums';
import { MainSeeder } from './src/seeds/main-seeder';
import { User } from './src/user/entities/user.entity';
import { config } from 'dotenv';
import { UserVerification } from './src/user/entities/user-verification.entity';
import { FileEntity } from './src/file/entities/file.entity';
import { CreateAndVerifyUser1740301060631 } from './migrations/1740301060631-create-and-verify-user';
import { CreateFileEntity1740301416004 } from './migrations/1740301416004-create-file-entity';
import { Log } from './src/logger/entities/log.entity';
import { CreateLoggerEntity1740301521390 } from './migrations/1740301521390-create-logger-entity';
import { Task } from './src/project/entities/task.entity';
import { Project } from './src/project/entities/project.entity';
import { CreateProjectTask1740462061541 } from './migrations/1740462061541-create-project-task';
import { Message } from './src/chat/entities/message.entity';
import { CreateMessage1740487533430 } from './migrations/1740487533430-create-message';
import { Chat } from './src/chat/entities/chat.entity';
import { CreateChat1740494422110 } from './migrations/1740494422110-create-chat';
import { UserChat } from './src/chat/entities/user.chat.entity';
import { AddUserChatAndEnum1740827362244 } from './migrations/1740827362244-add-user-chat-and-enum';
import { FileEntityUUID1740842180816 } from './migrations/1740842180816-file-entity-uuid';
import { ProjectImage1740844355246 } from './migrations/1740844355246-image-ref-remove';
import { ChatAvatar1740848332907 } from './migrations/1740848332907-chat-avatar';
import { TaskDetails1741097658314 } from './migrations/1741097658314-task-details';
import { TaskLog } from './src/project/entities/task-log.entity';
import { AddTaskLog1742030751151 } from './migrations/1742030751151-add-tast-log';
import { AddLastMessage1742228911850 } from './migrations/1742228911850-chat-last-message-column';
import { AddVoiceMessage1742382401988 } from './migrations/1742382401988-add-voice-message';
import { AddReactionAndAnswerMessage1742496172431 } from './migrations/1742496172431-add-reaction-and-answer-message';
import { FileMessage1743163586418 } from './migrations/1743163586418-file-message';
import { MessageReadByUsers1743260326540 } from './migrations/1743260326540-message-read-by-users';
import { ProjectMembers1748633190456 } from './migrations/1748633190456-project-members';
import { Threads } from './src/llm/entities/threads.entity';
import { ThreadMessages } from './src/llm/entities/thread-messages.entity';
import { Threads1755943711841 } from './migrations/1755943711841-threads';
import { ThreadMessageRole1755945896932 } from './migrations/1755945896932-thread-message-role';

config();
const configService = new ConfigService();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: configService.get(CONFIG.POSTGRES_HOST),
  port: configService.get(CONFIG.POSTGRES_PORT),
  username: configService.get(CONFIG.POSTGRES_USER),
  password: configService.get(CONFIG.POSTGRES_PASSWORD),
  database: configService.get(CONFIG.POSTGRES_DB),
  entities: [
    User,
    UserVerification,
    FileEntity,
    Log,
    Project,
    Task,
    Message,
    Chat,
    UserChat,
    TaskLog,
    Threads,
    ThreadMessages,
  ],
  migrations: [
    CreateAndVerifyUser1740301060631,
    CreateFileEntity1740301416004,
    CreateLoggerEntity1740301521390,
    CreateProjectTask1740462061541,
    CreateMessage1740487533430,
    CreateChat1740494422110,
    AddUserChatAndEnum1740827362244,
    FileEntityUUID1740842180816,
    ProjectImage1740844355246,
    ChatAvatar1740848332907,
    TaskDetails1741097658314,
    AddTaskLog1742030751151,
    AddLastMessage1742228911850,
    AddVoiceMessage1742382401988,
    AddReactionAndAnswerMessage1742496172431,
    FileMessage1743163586418,
    MessageReadByUsers1743260326540,
    ProjectMembers1748633190456,
    Threads1755943711841,
    ThreadMessageRole1755945896932,
  ],
  seeds: [MainSeeder],
};

export default new DataSource(options);
