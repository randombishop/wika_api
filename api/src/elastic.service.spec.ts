import 'dotenv/config';
import { ElasticSearchService } from './elastic.service';

const ES_SERVICE = new ElasticSearchService();
const TEST_URL1 = 'https://www.wika.network/';
const TEST_URL1_MD5 = '0b616d66133e1e57e216fa16ab5b6847';
const TEST_URL2 = 'https://www.test.com/';
const TEST_URL2_MD5 = '5ba534e2895f5119fc0bcab447a61104';

describe('ElasticSearchService', () => {
  describe('getUrlHash', () => {
    it('should hash an URL using MD5', () => {
      const hash = ES_SERVICE.getUrlHash(TEST_URL1);
      expect(hash).toBe(TEST_URL1_MD5);
    });
  });
  describe('moreLikeThis', () => {
    it('should return similar documents', async () => {
      const result = await ES_SERVICE.moreLikeThis([TEST_URL2_MD5]);
      expect(result.numHits).toBe(1);
      expect(result.hits[0].url).toBe(TEST_URL2);
    });
  });
});
