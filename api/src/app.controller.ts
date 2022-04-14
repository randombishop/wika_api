import { Controller, Get, Param } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { ElasticSearchService } from './elastic.service';
import Url from './types/url';
import UrlSearch from './types/url_search';

@Controller()
export class AppController {
  constructor(
    private readonly neo4j: Neo4jService,
    private readonly es: ElasticSearchService,
  ) {}

  @Get('/ping')
  ping(): string {
    return 'pong';
  }

  @Get('/user/:user/liked_urls')
  listUrlsByLiker(@Param() params): Promise<Url[]> {
    const user = params.user;
    return this.neo4j.listUrlsByLiker(user);
  }

  @Get('/user/:user/owned_urls')
  listUrlsByOwner(@Param() params): Promise<Url[]> {
    const user = params.user;
    return this.neo4j.listUrlsByOwner(user);
  }

  @Get('/url/search/:query')
  searchUrls(@Param() params): Promise<UrlSearch> {
    const query = params.query;
    return this.es.searchUrls(query);
  }

  @Get('/user/:user/recommend')
  async recommend(@Param() params): Promise<string> {
    console.log('recommend');
    const user = params.user;
    const connectedUrls = await this.neo4j.listUrlsByNetwork(user);
    console.log('connectedUrls');
    console.log(connectedUrls);
    return user;
  }
}
