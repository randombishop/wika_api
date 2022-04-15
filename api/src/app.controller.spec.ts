import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { Neo4jService } from './neo4j.service';
import { ElasticSearchService } from './elastic.service';

const TEST_USER1 = 'aaaaaaaaaaaaaaa';
const TEST_USER2 = 'bbbbbbbbbbbbbbb';
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

  describe('listUrlsByLiker', () => {
    it('should return urls liked by a user', async () => {
      const urls = await appController.listUrlsByLiker({ user: TEST_USER1 });
      expect(urls.length).toBe(2);
    });
  });

  describe('listUrlsByOwner', () => {
    it('should return urls owned by a user', async () => {
      const urls = await appController.listUrlsByOwner({ user: TEST_USER1 });
      expect(urls.length).toBe(1);
    });
  });

  describe('searchUrls', () => {
    it('should return an UrlSearch instance with numHits>0 and same number of documents', async () => {
      const result = await appController.searchUrls({
        user: TEST_USER1,
        query: TEST_QUERY1,
      });
      expect(result.numHits).toBeGreaterThan(0);
      expect(result.hits.length).toBe(result.numHits);
    });

    it('should return more results when adding an OR clause', async () => {
      const result1 = await appController.searchUrls({
        user: TEST_USER1,
        query: TEST_QUERY1,
      });
      const numHits1 = result1.numHits;
      const result2 = await appController.searchUrls({
        user: TEST_USER2,
        query: TEST_QUERY2,
      });
      const numHits2 = result2.numHits;
      expect(numHits2).toBeGreaterThan(numHits1);
    });
  });

  describe('recommend', () => {
    it('should return a list of recommendations for a user', async () => {
      const result = await appController.recommend({ user: TEST_USER2 });
      expect(result.numHits).toBe(1);
    });
  });

  describe('dispose', function () {
    it('should close the Neo4j driver', async function () {
      await neo4jService.dispose();
    });
  });
});
