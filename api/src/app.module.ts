import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { Neo4jService } from './neo4j.service';
import { ElasticSearchService } from './elastic.service';

/**
 * NestJS boilerplate code to build the API with its dependencies to
 * Neo4jService and ElasticSearchService
 */
@Module({
  imports: [],
  controllers: [AppController],
  providers: [Neo4jService, ElasticSearchService],
})
export class AppModule {}
