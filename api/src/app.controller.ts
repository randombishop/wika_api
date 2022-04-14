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

  @Get('/user/:user/search/:query')
  searchUrls(@Param() params): Promise<UrlSearch> {
    const query = params.query;
    const urls = this.es.searchUrls(query);
    return urls;
  }

  @Get('/user/:user/recommend')
  async recommend(@Param() params): Promise<UrlSearch> {
    const user = params.user;
    console.log('user', user) ;
    const connectedUrls = await this.neo4j.listUrlsByNetwork(user);
    if ((!connectedUrls) || connectedUrls.length == 0) {
        return;
    }
    const hashUrls = connectedUrls.map((x) => this.es.getUrlHash(x.url));
    const result = await this.es.moreLikeThis(hashUrls);
    if ((!result) || result.numHits == 0) {
        return;
    }
    const urls = result.hits.map((x) => {return x.url});
    console.log('urls', urls) ;
    const userLikes = this.neo4j.getUserNumLikes(urls, user) ;
    console.log('userLikes', JSON.stringify(userLikes)) ;
    const totalLikes = this.neo4j.getTotalNumLikes(urls) ;
    console.log('totalLikes', JSON.stringify(totalLikes)) ;
    return result;
  }
}
