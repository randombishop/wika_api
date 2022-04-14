import { Injectable } from '@nestjs/common';
import neo4j from 'neo4j-driver';
import Driver from 'neo4j-driver/lib/driver.js';
import Url from './types/url';

/**
 * Data Access utils for the Neo4j database
 *
 */
@Injectable()
export class Neo4jService {
  private driver: Driver;

  /**
   * Constructor relies on env vars `NEO4J_HOST`, `NEO4J_USER` and `NEO4J_PASS`
   */
  constructor() {
    const host = process.env.NEO4J_HOST;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASS;
    this.driver = neo4j.driver(host, neo4j.auth.basic(user, password));
  }

  /**
   * Runs a CQL query and returns results
   * @param cql - CQL query, for example `MATCH (a:Url {url: $url}) RETURN a`
   * @param params - Parameters of the CQL query as a dictionary, for example `{url: 'https://example.com'}`
   * @returns results as javascript dictionary if available, null otherwise
   */
  async fetch(cql: string, params: object = null) {
    //console.log(cql,params) ;
    const session = this.driver.session();
    const result = await session.run(cql, params);
    const records = [];
    for (let i = 0; i < result.records.length; i++) {
      records.push(result.records[i].get(0).properties);
    }
    await session.close();
    return records;
  }

  /**
   * Runs a CQL query using `fetch` function
   * and converts results to Url instances
   * @param cql - CQL query, for example `MATCH (a:Url {url: $url}) RETURN a`
   * @param params - Parameters of the CQL query as a dictionary, for example `{url: 'https://example.com'}`
   * @returns results as Url instances, null otherwise
   */
  async fetch2url(cql: string, params: object=null) {
    const data = await this.fetch(cql, params);
    if (data) {
      const urls = data.map((x) => new Url(x));
      return urls;
    } else {
      return null;
    }
  }

  /**
   * List the URLs liked or owned by a user
   * @param user - Address of the user
   * @param relation - either `LIKES` or `OWNS`
   * @returns urls as URL instances
   */
  async listUrlsByUserRelation(user: string, relation: string): Promise<Url[]> {
    if (relation != 'OWNS' && relation != 'LIKES') {
      throw 'Relation must be LIKES or OWNS';
    }
    const cql =
      'MATCH (user:User)-[r:' +
      relation +
      ']->(url:Url) where user.address=$user return url';
    const params = { user: user };
    return this.fetch2url(cql, params);
  }

  /**
   * List the URLs liked by a user
   * @param user - Address of the user
   * @returns urls as URL instances
   */
  async listUrlsByLiker(user: string): Promise<Url[]> {
    return this.listUrlsByUserRelation(user, 'LIKES');
  }

  /**
   * List the URLs owned by a user
   * @param user - Address of the user
   * @returns urls as URL instances
   */
  async listUrlsByOwner(user: string): Promise<Url[]> {
    return this.listUrlsByUserRelation(user, 'OWNS');
  }

  /**
   * List the URLs related to users who like or own common URLs with the target address
   * @param user - Address of the user
   * @returns urls as URL instances
   */
  async listUrlsByNetwork(user: string): Promise<Url[]> {
    const cql = `
        MATCH (user1:User{address:$user})-[]->(url1:Url)<-[]-(user2:User)-[]->(url2:Url)
        RETURN distinct url2
        ORDER BY url2.numLikes DESC
        LIMIT 100 ;`;
    const params = { user: user };
    return this.fetch2url(cql, params);
  }

  /**
   * Releases the Neo4J driver
   */
  async dispose(): Promise<void> {
    await this.driver.close();
  }
}
