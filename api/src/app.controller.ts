import { Controller, Get, Param} from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import Url from "./types/url";

@Controller()
export class AppController {

  constructor(private readonly neo4jService: Neo4jService) {}

  @Get('/ping')
  ping(): string {
    return 'pong';
  }

  @Get('/user/:user/liked_urls')
  listUrlsByLiker(@Param() params): Promise<Url[]> {
    const user = params.user;
    return this.neo4jService.listUrlsByLiker(user);
  }


}
