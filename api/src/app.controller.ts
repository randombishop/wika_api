import { Controller, Get } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

@Controller()
export class AppController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @Get('/ping')
  ping(): string {
    return 'pong';
  }
}
