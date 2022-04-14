import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { Neo4jService } from './neo4j.service';
import { ElasticSearchService } from './elastic.service';
import Url from './types/url';

const TEST_USER = 'aaaaaaaaaaaaaaa';
const TEST_QUERY1 = 'test';
const TEST_QUERY2 = '(test) OR (wika)';

describe('AppController', () => {
  let appController: AppController;
  let neo4jService: Neo4jService;
  //let esService: ElasticSearchService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [Neo4jService, ElasticSearchService],
    }).compile();

    appController = app.get<AppController>(AppController);
    neo4jService = app.get<Neo4jService>(Neo4jService);
    //esService = app.get<ElasticSearchService>(ElasticSearchService);
  });

  describe('ping', () => {
    it('should return "pong"', () => {
      expect(appController.ping()).toBe('pong');
    });
  });

  describe('neo4jService', () => {
    describe('fetch', () => {
      it('should fetch data from the neo4j database as nodes', async () => {
        const cql = 'MATCH (n) RETURN n LIMIT 5';
        const urls = await neo4jService.fetch(cql);
        expect(urls.length).toBe(5);
      });
    });

    describe('fetch2url', () => {
      it('should fetch data from the neo4j database as nodes', async () => {
        const cql = 'MATCH (n) RETURN n LIMIT 5';
        const urls = await neo4jService.fetch2url(cql);
        expect(urls.length).toBe(5);
        expect(urls[0] instanceof Url);
      });
    });

    describe('listUrlsByUserRelation', () => {
      it('should throw an error if relation is not LIKES or OWNS', async () => {
        let test = null;
        try {
          test = await neo4jService.listUrlsByUserRelation(TEST_USER, 'TEST');
        } catch (e) {
          expect(e).toBe('Relation must be LIKES or OWNS');
        }
        expect(test).toBeNull();
      });
    });

    describe('listUrlsByNetwork', () => {
      it('should return 2 connected URLs for the test user', async () => {
        const urls = await neo4jService.listUrlsByNetwork(TEST_USER);
        expect(urls.length).toBe(2);
      });
    });
  });

  describe('listUrlsByLiker', () => {
    it('should return urls liked by a user', async () => {
      const urls = await appController.listUrlsByLiker({ user: TEST_USER });
      expect(urls.length).toBe(2);
    });
  });

  describe('listUrlsByOwner', () => {
    it('should return urls owned by a user', async () => {
      const urls = await appController.listUrlsByOwner({ user: TEST_USER });
      expect(urls.length).toBe(1);
    });
  });

  describe('searchUrls', () => {
    it('should return an UrlSearch instance with numHits>0 and same number of documents', async () => {
      const result = await appController.searchUrls({ query: TEST_QUERY1 });
      expect(result.numHits).toBeGreaterThan(0);
      expect(result.hits.length).toBe(result.numHits);
    });

    it('should return more results when adding an OR clause', async () => {
      const result1 = await appController.searchUrls({ query: TEST_QUERY1 });
      const numHits1 = result1.numHits;
      const result2 = await appController.searchUrls({ query: TEST_QUERY2 });
      const numHits2 = result2.numHits;
      expect(numHits2).toBeGreaterThan(numHits1);
    });
  });

  describe('recommend', () => {
    it('should return a list of recommendations for a user', async () => {
      const urls = await appController.recommend({ user: TEST_USER });
    });
  });

  describe('dispose', function () {
    it('should close the Neo4j driver', async function () {
      await neo4jService.dispose();
    });
  });
});
