import { Injectable } from '@nestjs/common';
import neo4j from "neo4j-driver";
import Driver from "neo4j-driver/lib/driver.js";

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
  async fetch(cql: string, params: object) {
    //console.log(cql,params) ;
    const session = this.driver.session();
    const result = await session.run(cql, params);
    const records = [];
    for (var i=0 ; i<result.records.length; i++) {
      records.push(result.records[i].get(0).properties);
    }
    await session.close();
    return records;
  }

  /**
   * List the URLs liked by a user
   * @param user - Address of the user
   * @returns urls as URL instances
   */
  async listUrlsByLiker(user: string) {
    const cql = "MATCH (user:User)-[LIKES]->(url:Url) where user.address=$user return distinct url";
    const params = { user: user };
    const data = await this.fetch(cql, params);
    return data;
  }

}
