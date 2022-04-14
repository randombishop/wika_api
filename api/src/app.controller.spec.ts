import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { Neo4jService } from './neo4j.service';
import { ElasticSearchService } from './elastic.service';
import Url from './types/url';

const TEST_USER1 = 'aaaaaaaaaaaaaaa';
const TEST_USER2 = 'bbbbbbbbbbbbbbb';
const TEST_QUERY1 = 'test';
const TEST_QUERY2 = '(test) OR (wika)';
const TEST_URL1 = 'https://www.wika.network/';
const TEST_URL1_MD5 = '0b616d66133e1e57e216fa16ab5b6847';
const TEST_URL2 = 'https://www.test.com/';
const TEST_URL2_MD5 = '5ba534e2895f5119fc0bcab447a61104';

describe('AppController', () => {
  let appController: AppController;
  let neo4jService: Neo4jService;
  let esService: ElasticSearchService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [Neo4jService, ElasticSearchService],
    }).compile();

    appController = app.get<AppController>(AppController);
    neo4jService = app.get<Neo4jService>(Neo4jService);
    esService = app.get<ElasticSearchService>(ElasticSearchService);
  });

  describe('ping', () => {
    it('should return "pong"', () => {
      expect(appController.ping()).toBe('pong');
    });
  });

  describe('Neo4jService', () => {
    describe('fetchRecords', () => {
      it('should fetch data from the neo4j database as rows', async () => {
        const cql = 'MATCH (n) RETURN n LIMIT 5';
        const rows = await neo4jService.fetchRecords(cql);
        expect(rows.length).toBe(5);
      });
    });

    describe('fetchProperties', () => {
      it('should fetch data from the neo4j database as node properties', async () => {
        const cql = 'MATCH (n) RETURN n LIMIT 5';
        const props = await neo4jService.fetchProperties(cql);
        expect(props.length).toBe(5);
        expect(props[0].url || props[0].address).toBeTruthy();
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
          test = await neo4jService.listUrlsByUserRelation(TEST_USER1, 'TEST');
        } catch (e) {
          expect(e).toBe('Relation must be LIKES or OWNS');
        }
        expect(test).toBeNull();
      });
    });

    describe('listUrlsByNetwork', () => {
      it('should return 2 connected URLs for the test user', async () => {
        const urls = await neo4jService.listUrlsByNetwork(TEST_USER1);
        expect(urls.length).toBe(2);
      });
    });

    describe('getUserNumLikes', () => {
      it('should ...', async () => {
        const likes = await neo4jService.getUserNumLikes(
          [TEST_URL1],
          TEST_USER1,
        );
        expect(likes[TEST_URL1]).toBe(20);
      });
    });

    describe('getTotalNumLikes', () => {
      it('should ...', async () => {
        const likes = await neo4jService.getTotalNumLikes([TEST_URL1]);
        expect(likes[TEST_URL1]).toBe(20);
      });
    });
  });

  describe('ElasticSearchService', () => {
    describe('getUrlHash', () => {
      it('should hash an URL using MD5', () => {
        const hash = esService.getUrlHash(TEST_URL1);
        expect(hash).toBe(TEST_URL1_MD5);
      });
    });
    describe('moreLikeThis', () => {
      it('should return similar documents', async () => {
        const result = await esService.moreLikeThis([TEST_URL2_MD5]);
        expect(result.numHits).toBe(1);
        expect(result.hits[0].url).toBe(TEST_URL2);
      });
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
