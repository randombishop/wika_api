import { Injectable } from '@nestjs/common';
import neo4j from "neo4j-driver";
import Driver from "neo4j-driver/lib/driver.js";


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

  getHello(): string {
    return 'Hello World!';
  }
}
