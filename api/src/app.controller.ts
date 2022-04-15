import { Controller, Get, Param } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { ElasticSearchService } from './elastic.service';
import Url from './types/url';
import UrlSearch from './types/url_search';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';


@Controller()
@ApiTags('wika')
export class AppController {
  constructor(
    private readonly neo4j: Neo4jService,
    private readonly es: ElasticSearchService,
  ) {}

  @Get('/ping')
  @ApiOperation({summary: 'Healthcheck'})
  @ApiProduces('text/plain')
  @ApiResponse({
    status: 200,
    description: 'Healthcheck endpoint',
    schema: {type: 'string', example: 'pong'}
  })
  ping(): string {
    return 'pong';
  }

  @Get('/user/:user/liked_urls')
  @ApiOperation({summary: 'List the Urls liked by a user'})
  @ApiParam({name:'user', description:'address of the user', example:'5HMaX8cQefCrvhwAZKbeqiWEaYB29jHryyodBxoAoggFf38L'})
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Array of Urls liked by the specified user',
    type: Url
  })
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
    const connectedUrls = await this.neo4j.listUrlsByNetwork(user);
    if (!connectedUrls || connectedUrls.length == 0) {
      return;
    }
    const hashUrls = connectedUrls.map((x) => this.es.getUrlHash(x.url));
    const result = await this.es.moreLikeThis(hashUrls);
    if (!result || result.numHits == 0) {
      return;
    }
    const urls = result.hits.map((x) => {
      return x.url;
    });
    const userLikes = await this.neo4j.getUserNumLikes(urls, user);
    const totalLikes = await this.neo4j.getTotalNumLikes(urls);
    for (let i = 0; i < result.hits.length; i++) {
      const data = result.hits[i];
      if (userLikes[data.url]) {
        data.numLikesUser = userLikes[data.url];
      }
      if (totalLikes[data.url]) {
        data.numLikesTotal = totalLikes[data.url];
      }
    }
    return result;
  }
}
