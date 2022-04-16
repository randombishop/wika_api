import 'dotenv/config';
import { Neo4jService } from './neo4j.service';
import Url from './types/url';

const NEO4j_SERVICE = new Neo4jService();
const TEST_USER1 = 'aaaaaaaaaaaaaaa';
const TEST_URL1 = 'https://www.wika.network/';

describe('Neo4jService', () => {
  describe('fetchRecords', () => {
    it('should fetch data from the neo4j database as rows', async () => {
      const cql = 'MATCH (n) RETURN n LIMIT 5';
      const rows = await NEO4j_SERVICE.fetchRecords(cql);
      expect(rows.length).toBe(5);
    });
  });

  describe('fetchProperties', () => {
    it('should fetch data from the neo4j database as node properties', async () => {
      const cql = 'MATCH (n) RETURN n LIMIT 5';
      const props = await NEO4j_SERVICE.fetchProperties(cql);
      expect(props.length).toBe(5);
      expect(props[0].url || props[0].address).toBeTruthy();
    });
  });

  describe('fetch2url', () => {
    it('should fetch data from the neo4j database as nodes', async () => {
      const cql = 'MATCH (n) RETURN n LIMIT 5';
      const urls = await NEO4j_SERVICE.fetch2url(cql);
      expect(urls.length).toBe(5);
      expect(urls[0] instanceof Url);
    });
  });

  describe('listUrlsByUserRelation', () => {
    it('should throw an error if relation is not LIKES or OWNS', async () => {
      let test = null;
      try {
        test = await NEO4j_SERVICE.listUrlsByUserRelation(TEST_USER1, 'TEST');
      } catch (e) {
        expect(e).toBe('Relation must be LIKES or OWNS');
      }
      expect(test).toBeNull();
    });
  });

  describe('listUrlsByNetwork', () => {
    it('should return 2 connected URLs for the test user', async () => {
      const urls = await NEO4j_SERVICE.listUrlsByNetwork(TEST_USER1);
      expect(urls.length).toBe(2);
    });
  });

  describe('getUserNumLikes', () => {
    it('should ...', async () => {
      const likes = await NEO4j_SERVICE.getUserNumLikes(
        [TEST_URL1],
        TEST_USER1,
      );
      expect(likes[TEST_URL1]).toBe(20);
    });
  });

  describe('getTotalNumLikes', () => {
    it('should ...', async () => {
      const likes = await NEO4j_SERVICE.getTotalNumLikes([TEST_URL1]);
      expect(likes[TEST_URL1]).toBe(20);
    });
  });

  describe('dispose', function () {
    it('should close the Neo4j driver', async function () {
      await NEO4j_SERVICE.dispose();
    });
  });
});
