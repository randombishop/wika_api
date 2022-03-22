import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { Neo4jService } from './neo4j.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [Neo4jService],
})
export class AppModule {}
