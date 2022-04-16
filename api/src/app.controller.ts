import { Controller, Get, Param } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { ElasticSearchService } from './elastic.service';
import Url from './types/url';
import UrlSearch from './types/url_search';
import { addNumLikesToSearchResults } from './utils';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';

/**
 * The AppController class is the API logic published by NestJS framework
 * this class uses the Neo4jService and ElasticSearchService services
 * to perform the following operations:
 * - `ping` => Healthcheck
 * - `/user/:user/liked_urls` => List the Urls liked by a user
 * - `/user/:user/owned_urls` => List the Urls owned by a user
 * - `/user/:user/search/:query` => Execute a search query against the elastic search Url index
 * - `/user/:user/recommend` => Generate recommendations for a specific user based on their Likes/Ownerships,
 * network connections, and keywords
 *
 * The functions are annotated with NestJS and Swagger directives for documentation and front end auto-generation.
 */
@Controller()
@ApiTags('wika')
export class AppController {
  constructor(
    private readonly neo4j: Neo4jService,
    private readonly es: ElasticSearchService,
  ) {}

  /**
   * /ping => Healthcheck
   */
  @Get('/ping')
  @ApiOperation({ summary: 'Healthcheck' })
  @ApiProduces('text/plain')
  @ApiResponse({
    status: 200,
    description: 'Healthcheck endpoint',
    schema: { type: 'string', example: 'pong' },
  })
  ping(): string {
    return 'pong';
  }

  /**
   * /user/:user/liked_urls => List the Urls liked by a user
   */
  @Get('/user/:user/liked_urls')
  @ApiOperation({ summary: 'List the Urls liked by a user' })
  @ApiParam({
    name: 'user',
    description: 'Address of the user',
    example: '5HMaX8cQefCrvhwAZKbeqiWEaYB29jHryyodBxoAoggFf38L',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Array of Urls liked by the specified user',
    isArray: true,
    type: Url,
  })
  async listUrlsByLiker(@Param() params): Promise<Url[]> {
    const user = params.user;
    return this.neo4j.listUrlsByLiker(user);
  }

  /**
   * /user/:user/owned_urls => List the Urls owned by a user
   */
  @Get('/user/:user/owned_urls')
  @ApiOperation({ summary: 'List the Urls owned by a user' })
  @ApiParam({
    name: 'user',
    description: 'Address of the user',
    example: '5HMaX8cQefCrvhwAZKbeqiWEaYB29jHryyodBxoAoggFf38L',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Array of Urls owned by the specified user',
    isArray: true,
    type: Url,
  })
  async listUrlsByOwner(@Param() params): Promise<Url[]> {
    const user = params.user;
    return this.neo4j.listUrlsByOwner(user);
  }

  /**
   * /user/:user/search/:query => Execute a search query against the elastic search Url index
   */
  @Get('/user/:user/search/:query')
  @ApiOperation({
    summary: 'Execute a search query against the elastic search Url index',
  })
  @ApiParam({
    name: 'user',
    description:
      'Address of the user, will be used to populate the number of likes',
    example: '5HMaX8cQefCrvhwAZKbeqiWEaYB29jHryyodBxoAoggFf38L',
  })
  @ApiParam({
    name: 'query',
    description: 'Elastic Search compatible query',
    example: '(test) OR (wika)',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: UrlSearch,
  })
  async searchUrls(@Param() params): Promise<UrlSearch> {
    const user = params.user;
    const query = params.query;
    const result = await this.es.searchUrls(query);
    await addNumLikesToSearchResults(result, user, this.neo4j);
    return result;
  }

  /**
   * /user/:user/recommend` => Generate recommendations for a specific user based on their Likes/Ownerships,
   * network connections, and keywords.
   *
   * This implementation is a simple MVP that performs the following algorithm:
   * 1) get connectedUrls using `neo4j.listUrlsByNetwork(user)`: for example, if the user U1 liked a website,
   * and the same website was liked or owned by a another user U2, all Urls connected to U2 are considered connected.
   * The function also orders all connected Urls by total number of likes and returns the top 100
   * 2) The connected urls are passed to Elastic Search `More Like This` search method,
   * returning a list of similar documents ordered by matching score.
   * 3) Adds the total numbers of likes and the user number of likes to the search results.
   */
  @Get('/user/:user/recommend')
  @ApiOperation({
    summary: `Generate recommendations for a specific user based on their Likes/Ownerships,
              network connections, and keywords`,
  })
  @ApiParam({
    name: 'user',
    description: 'Address of the user',
    example: '5HMaX8cQefCrvhwAZKbeqiWEaYB29jHryyodBxoAoggFf38L',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: UrlSearch,
  })
  async recommend(@Param() params): Promise<UrlSearch> {
    const user = params.user;
    const connectedUrls = await this.neo4j.listUrlsByNetwork(user);
    if (!connectedUrls || connectedUrls.length == 0) {
      return null;
    }
    const hashUrls = connectedUrls.map((x) => this.es.getUrlHash(x.url));
    const result = await this.es.moreLikeThis(hashUrls);
    if (!result || result.numHits == 0) {
      return null;
    }
    await addNumLikesToSearchResults(result, user, this.neo4j);
    return result;
  }
}
