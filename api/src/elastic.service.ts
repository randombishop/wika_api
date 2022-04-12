import { Injectable } from '@nestjs/common';
import UrlSearch from './types/url_search';
import fetch from 'node-fetch';

/**
 * Data Access utils for the Neo4j database
 *
 */
@Injectable()
export class ElasticSearchService {
  private host: string;
  private auth: string;

  /**
   * Constructor relies on env vars `ES_HOST`, `ES_USER` and `ES_PASS`
   */
  constructor() {
    this.host = process.env.ES_HOST;
    const user = process.env.ES_USER;
    const password = process.env.ES_PASS;
    const buff = new Buffer(user + ':' + password);
    this.auth = 'Basic ' + buff.toString('base64');
  }

  /**
   * Calls the Elastic Search API and returns the parsed JSON result
   * @param path - API endpoint, for example `'/url/_doc/'
   * @param config - dictionary of options to be passed to the fetch function, for example `{method:'POST', body:'...'}`
   * @returns JSON result parsed as a javascript dictionary
   */
  async callApiAndGetResult(path, config) {
    config.headers = {
      Authorization: this.auth,
      'Content-Type': 'application/json',
    };
    const response = await fetch(this.host + path, config);
    const data = await response.json();
    return data;
  }

  /**
   * Executes the query against the URL index
   * @param query - Elastic Search query
   * @returns array of hits as UrlMetadata instances
   */
  async searchUrls(query: string) {
    const data = {
      query: {
        query_string: {
          query: query,
        },
      },
    };
    const rest_path = '/url/_search';
    const rest_config = {
      method: 'post',
      body: JSON.stringify(data),
    };
    const response = await this.callApiAndGetResult(rest_path, rest_config);
    const result = new UrlSearch(response);
    return result;
  }
}
